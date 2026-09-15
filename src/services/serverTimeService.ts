// Authoritative server-side and Supabase time synchronization service for Needly
// Manages 48-hour request expiration and real-time synchronized timers

export const REQUEST_EXPIRATION_HOURS = 48;
export const REQUEST_EXPIRATION_MS = REQUEST_EXPIRATION_HOURS * 60 * 60 * 1000; // 172,800,000 ms

class ServerTimeService {
  private clockOffsetMs: number = 0;
  private isSynced: boolean = false;
  private syncPromise: Promise<number> | null = null;
  private lastSyncTime: number = 0;
  private lastTriggerCheck: number = 0;

  constructor() {
    // Initial sync on startup
    if (typeof window !== 'undefined') {
      this.syncServerTime().catch(() => {});
      // Re-sync every 5 minutes or on window focus to adjust for sleep/clock drift
      window.addEventListener('focus', () => this.syncServerTime(true).catch(() => {}));
      setInterval(() => this.syncServerTime(true).catch(() => {}), 5 * 60 * 1000);
    }
  }

  /**
   * Synchronize clock with the server-side time API (/api/server-time)
   */
  public async syncServerTime(force = false): Promise<number> {
    const now = Date.now();
    if (!force && this.isSynced && now - this.lastSyncTime < 60000) {
      return this.clockOffsetMs;
    }

    if (this.syncPromise) {
      return this.syncPromise;
    }

    this.syncPromise = (async () => {
      try {
        const start = Date.now();
        const res = await fetch('/api/server-time', { cache: 'no-store' });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const end = Date.now();
        const roundTrip = (end - start) / 2;
        const serverTs = typeof data.timestamp === 'number' ? data.timestamp : new Date(data.iso).getTime();
        
        // Estimated server time at moment of response arrival:
        this.clockOffsetMs = (serverTs + roundTrip) - end;
        this.isSynced = true;
        this.lastSyncTime = Date.now();
        return this.clockOffsetMs;
      } catch {
        // Fallback: If network or server is temporarily unreachable, use local time (offset 0)
        return this.clockOffsetMs;
      } finally {
        this.syncPromise = null;
      }
    })();

    return this.syncPromise;
  }

  public async syncWithServer(): Promise<number> {
    return this.syncServerTime();
  }

  /**
   * Returns authoritative server timestamp in milliseconds
   */
  public getServerTime(): number {
    return Date.now() + this.clockOffsetMs;
  }

  /**
   * Returns ISO string of authoritative server time
   */
  public getServerTimeIso(): string {
    return new Date(this.getServerTime()).toISOString();
  }

  /**
   * Calculates the exact expiration timestamp for a request (createdAt + 48 hours)
   */
  public getRequestExpiresAt(createdAt: string | number | undefined | null): number {
    if (!createdAt) {
      return this.getServerTime() + REQUEST_EXPIRATION_MS;
    }
    const createdTs = typeof createdAt === 'number' ? createdAt : new Date(createdAt).getTime();
    if (isNaN(createdTs) || createdTs <= 0) {
      return this.getServerTime() + REQUEST_EXPIRATION_MS;
    }
    return createdTs + REQUEST_EXPIRATION_MS;
  }

  /**
   * Returns remaining milliseconds before 48-hour expiration
   */
  public getRemainingTimeMs(createdAt: string | number | undefined | null): number {
    const expiresAt = this.getRequestExpiresAt(createdAt);
    const serverNow = this.getServerTime();
    return Math.max(0, expiresAt - serverNow);
  }

  /**
   * Returns true if request has exceeded 48 hours based on server time
   */
  public isRequestExpired(createdAt: string | number | undefined | null): boolean {
    return this.getRemainingTimeMs(createdAt) <= 0;
  }

  /**
   * Breakdown of remaining time into hours, minutes, seconds
   */
  public getCountdown(createdAt: string | number | undefined | null): {
    hours: number;
    minutes: number;
    seconds: number;
    totalMs: number;
    isExpired: boolean;
  } {
    const totalMs = this.getRemainingTimeMs(createdAt);
    if (totalMs <= 0) {
      return { hours: 0, minutes: 0, seconds: 0, totalMs: 0, isExpired: true };
    }

    const totalSeconds = Math.floor(totalMs / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return {
      hours,
      minutes,
      seconds,
      totalMs,
      isExpired: false
    };
  }

  /**
   * Formats remaining time nicely (e.g., "47h 50m", "15m 30s", or "00:00:00")
   * Ensures the timer representation is never removed or missing while requested
   */
  public formatRemainingCountdown(createdAt: string | number | undefined | null): string {
    if (!createdAt) {
      return '48h 0m';
    }
    const cd = this.getCountdown(createdAt);
    if (cd.isExpired) {
      return '00:00:00';
    }
    if (cd.hours > 0) {
      return `${cd.hours}h ${cd.minutes}m`;
    }
    if (cd.minutes > 0) {
      return `${cd.minutes}m ${cd.seconds}s`;
    }
    return `${cd.seconds}s`;
  }

  /**
   * Request server-side check and expiration execution
   */
  public async triggerServerExpireCheck(): Promise<any> {
    const now = Date.now();
    if (now - this.lastTriggerCheck < 15000) {
      return null;
    }
    this.lastTriggerCheck = now;
    try {
      const res = await fetch('/api/requests/expire-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // ignore
    }
    return null;
  }
}

export const serverTimeService = new ServerTimeService();
