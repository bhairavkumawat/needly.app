import { Capacitor } from '@capacitor/core';
import { Share } from '@capacitor/share';
import { ServiceListing } from '../types';

/**
 * Returns the canonical website URL for a service listing.
 * Prefers VITE_WEB_APP_URL from environment, or current window origin, or default domain.
 */
export function getServiceShareUrl(serviceId: string): string {
  const envUrl = import.meta.env.VITE_WEB_APP_URL;
  let baseUrl = '';

  if (envUrl && typeof envUrl === 'string' && envUrl.trim() !== '') {
    baseUrl = envUrl.trim().replace(/\/+$/, '');
  } else if (typeof window !== 'undefined' && window.location && window.location.origin) {
    const origin = window.location.origin;
    // If not a local file URL or android webview local host
    if (origin.startsWith('http') && !origin.includes('localhost:3000') && !origin.includes('127.0.0.1')) {
      baseUrl = origin.replace(/\/+$/, '');
    } else {
      // In development or local preview, prefer current origin if accessible, otherwise production domain
      baseUrl = origin.startsWith('http') ? origin.replace(/\/+$/, '') : 'https://needly.in';
    }
  } else {
    baseUrl = 'https://needly.in';
  }

  return `${baseUrl}/service/${encodeURIComponent(serviceId)}`;
}

export interface ShareResult {
  success: boolean;
  method: 'native' | 'web_share' | 'clipboard' | 'cancelled';
  message: string;
  url: string;
}

/**
 * Shares a service listing using the native Android share sheet (via @capacitor/share),
 * with standard Web Share API and Clipboard fallbacks.
 */
export async function shareServiceListing(service: ServiceListing): Promise<ShareResult> {
  const shareUrl = getServiceShareUrl(service.id);
  const shareTitle = 'Check out this service on Needly';
  const shareText = `Check out "${service.title}" by ${service.providerName} on Needly:\n${shareUrl}`;

  // 1. Capacitor Native Share on Android / iOS
  if (Capacitor.isNativePlatform()) {
    try {
      await Share.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
        dialogTitle: 'Share Service via',
      });
      return {
        success: true,
        method: 'native',
        message: 'Shared successfully',
        url: shareUrl,
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      // User dismissed the share sheet
      if (errMsg.toLowerCase().includes('cancel') || errMsg.toLowerCase().includes('dismiss')) {
        return {
          success: false,
          method: 'cancelled',
          message: 'Share cancelled',
          url: shareUrl,
        };
      }
      console.warn('[Share] Native share failed, attempting fallback:', err);
    }
  }

  // 2. Web Share API (Browsers on mobile/desktop supporting navigator.share)
  if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
    try {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      return {
        success: true,
        method: 'web_share',
        message: 'Shared successfully',
        url: shareUrl,
      };
    } catch (err: any) {
      if (err?.name === 'AbortError') {
        return {
          success: false,
          method: 'cancelled',
          message: 'Share cancelled',
          url: shareUrl,
        };
      }
      console.warn('[Share] Web share failed, copying to clipboard:', err);
    }
  }

  // 3. Fallback: Copy link to clipboard
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      return {
        success: true,
        method: 'clipboard',
        message: 'Service link copied to clipboard!',
        url: shareUrl,
      };
    }
  } catch (err) {
    console.warn('[Share] Clipboard writeText failed:', err);
  }

  // Last-resort fallback: prompt
  try {
    if (typeof window !== 'undefined') {
      window.prompt('Copy this service link:', shareUrl);
      return {
        success: true,
        method: 'clipboard',
        message: 'Service link ready to copy',
        url: shareUrl,
      };
    }
  } catch {}

  return {
    success: false,
    method: 'clipboard',
    message: 'Could not share link',
    url: shareUrl,
  };
}
