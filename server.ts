import express from 'express';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// Supabase configuration for server-side time authoritative checks
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ldivsmoqttphhuwdjszh.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaXZzbW9xdHRwaGh1d2Rqc3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTUwODAsImV4cCI6MjEwNDE3MTA4MH0.vHKy_SbZkVJOjapYq_BJLO5XRMf14OvViZ_-8nfA1RY';

let supabaseServer: any = null;
try {
  supabaseServer = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (err) {
  console.warn('[Server] Supabase client init warning:', err);
}

// 48 hours in milliseconds
const FORTY_EIGHT_HOURS_MS = 48 * 60 * 60 * 1000;

async function checkAndExpireRequestsServerSide() {
  if (!supabaseServer) return { expiredRentals: [], expiredServices: [] };
  try {
    const serverNow = Date.now();
    const fortyEightHoursAgo = new Date(serverNow - FORTY_EIGHT_HOURS_MS).toISOString();

    // 1. Expire pending rental_requests older than 48 hours
    const { data: expiredRentals, error: rErr } = await supabaseServer
      .from('rental_requests')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lte('created_at', fortyEightHoursAgo)
      .select('id, listing_id, renter_id, owner_id');

    if (rErr && !rErr.message?.includes('does not exist')) {
      console.warn('[Server] Auto-expire rental_requests warning:', rErr.message);
    }

    // 2. Expire pending service_bookings older than 48 hours
    const { data: expiredServices, error: sErr } = await supabaseServer
      .from('service_bookings')
      .update({ status: 'cancelled' })
      .eq('status', 'pending')
      .lte('created_at', fortyEightHoursAgo)
      .select('id, listing_id, customer_id, provider_id');

    if (sErr && !sErr.message?.includes('does not exist')) {
      console.warn('[Server] Auto-expire service_bookings warning:', sErr.message);
    }

    const totalExpired = (expiredRentals?.length || 0) + (expiredServices?.length || 0);
    if (totalExpired > 0) {
      console.log(`[Server 48h Expiration] Auto-cancelled ${totalExpired} expired pending requests.`);
    }

    return {
      expiredRentals: expiredRentals || [],
      expiredServices: expiredServices || []
    };
  } catch (err: any) {
    console.warn('[Server] Auto-expire execution check error:', err?.message || err);
    return { expiredRentals: [], expiredServices: [] };
  }
}

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  const isProduction = process.env.NODE_ENV === 'production';

  // In Google AI Studio and Cloud Run container architecture, the container's built-in
  // Nginx reverse proxy listens externally on port 8080 and forwards all app traffic to localhost:3000.
  // The Node application MUST strictly bind to port 3000. Binding to 8080 causes EADDRINUSE crash.
  const PORT = 3000;

  app.use(express.json());

  // Authoritative server-side time endpoint for synchronization
  app.get(['/api/server-time', '/api/time'], (req, res) => {
    const now = Date.now();
    res.status(200).json({
      timestamp: now,
      iso: new Date(now).toISOString(),
      expirationHours: 48,
    });
  });

  // Server-side trigger to check and expire pending requests older than 48 hours
  app.all(['/api/requests/expire-check', '/api/expire-check'], async (req, res) => {
    const results = await checkAndExpireRequestsServerSide();
    res.status(200).json({
      status: 'ok',
      timestamp: Date.now(),
      iso: new Date().toISOString(),
      ...results
    });
  });

  // Background timer checking for expired requests every 30 seconds
  const expireInterval = setInterval(() => {
    checkAndExpireRequestsServerSide().catch(() => {});
  }, 30 * 1000);

  // Health check endpoints for Cloud Run container liveness/readiness probes
  app.get(['/api/health', '/health', '/_ah/health', '/ping'], (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // ==============================================================================
  // AUTHORIZED ADMIN SYSTEM (SERVER-SIDE ENFORCEMENT)
  // Strictly restricted to 3 authorized emails. All other emails receive 403 Forbidden.
  // ==============================================================================
  const AUTHORIZED_ADMIN_EMAILS = new Set([
    'sayyedamaan2004@gmail.com',
    'bhairavgk999@gmail.com',
    'needlyudaipur@gmail.com'
  ]);

  interface AdminAuditEntry {
    id: string;
    timestamp: string;
    adminEmail: string;
    action: string;
    details: string;
    targetId?: string;
  }

  const adminAuditLogs: AdminAuditEntry[] = [
    {
      id: 'log-init-1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      adminEmail: 'sayyedamaan2004@gmail.com',
      action: 'SYSTEM_STARTUP',
      details: 'Needly Local Services Marketplace server engine booted in secure mode'
    }
  ];

  const requireAdminAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const rawEmail = (
      req.headers['x-admin-email'] ||
      req.headers['authorization']?.replace(/^Bearer\s+/i, '') ||
      req.body?.adminEmail ||
      req.query?.adminEmail ||
      ''
    ).toString().toLowerCase().trim();

    if (!rawEmail || !AUTHORIZED_ADMIN_EMAILS.has(rawEmail)) {
      console.warn(`[Admin Security] Blocked unauthorized admin attempt by: "${rawEmail || 'anonymous'}" to ${req.method} ${req.path}`);
      return res.status(403).json({
        error: 'Forbidden: Access restricted to authorized Needly administrators only.',
        code: 'UNAUTHORIZED_ADMIN',
        attemptedEmail: rawEmail || null
      });
    }

    (req as any).adminEmail = rawEmail;
    next();
  };

  // 1. Verify Admin Status
  app.post('/api/admin/verify', (req, res) => {
    const rawEmail = (req.body?.email || req.headers['x-admin-email'] || '').toString().toLowerCase().trim();
    const isAuthorized = AUTHORIZED_ADMIN_EMAILS.has(rawEmail);
    if (!isAuthorized) {
      return res.status(403).json({
        authorized: false,
        error: 'Forbidden: This email address is not registered as an authorized Needly administrator.'
      });
    }
    return res.status(200).json({
      authorized: true,
      email: rawEmail,
      role: 'superadmin',
      permissions: ['manage_services', 'manage_providers', 'manage_requests', 'view_metrics', 'expire_check']
    });
  });

  // 2. Admin System Statistics (authoritative server metrics)
  app.get('/api/admin/stats', requireAdminAuth, async (req, res) => {
    try {
      let servicesCount = 0;
      let profilesCount = 0;
      let bookingsCount = 0;
      let needsCount = 0;

      if (supabaseServer) {
        const [sRes, pRes, bRes, nRes] = await Promise.all([
          supabaseServer.from('services').select('id', { count: 'exact', head: true }),
          supabaseServer.from('profiles').select('id', { count: 'exact', head: true }),
          supabaseServer.from('service_bookings').select('id', { count: 'exact', head: true }),
          supabaseServer.from('needs').select('id', { count: 'exact', head: true })
        ]);
        servicesCount = sRes.count || 0;
        profilesCount = pRes.count || 0;
        bookingsCount = bRes.count || 0;
        needsCount = nRes.count || 0;
      }

      res.status(200).json({
        marketplaceMode: 'service_only',
        servicesCount,
        profilesCount,
        bookingsCount,
        needsCount,
        serverUptimeSeconds: Math.floor(process.uptime()),
        serverTimestamp: Date.now(),
        serverTimeIso: new Date().toISOString(),
        authoritativeExpirationHours: 48,
        authorizedAdminCount: AUTHORIZED_ADMIN_EMAILS.size
      });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch admin statistics' });
    }
  });

  // 3. Admin Services Management
  app.get('/api/admin/services', requireAdminAuth, async (req, res) => {
    try {
      if (!supabaseServer) return res.status(200).json({ services: [] });
      const { data, error } = await supabaseServer
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json({ services: data || [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch services' });
    }
  });

  // 4. Admin Toggle Service Availability / Status
  app.post('/api/admin/services/:id/toggle-status', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { available } = req.body;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer
          .from('services')
          .update({ available: Boolean(available) })
          .eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: available ? 'ACTIVATE_SERVICE' : 'SUSPEND_SERVICE',
        details: `Service "${id}" availability changed to ${Boolean(available)}`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, available });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update service' });
    }
  });

  // 4b. Admin Toggle Featured Status
  app.post('/api/admin/services/:id/feature', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { isFeatured } = req.body;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer
          .from('services')
          .update({ is_featured: Boolean(isFeatured) })
          .eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: isFeatured ? 'FEATURE_SERVICE' : 'UNFEATURE_SERVICE',
        details: `Service "${id}" featured status set to ${Boolean(isFeatured)}`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, isFeatured: Boolean(isFeatured) });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update service featured status' });
    }
  });

  // 4c. Admin Toggle Service Verification Badge
  app.post('/api/admin/services/:id/verify', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { isVerified } = req.body;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer
          .from('services')
          .update({ is_provider_verified: Boolean(isVerified) })
          .eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: isVerified ? 'VERIFY_SERVICE' : 'UNVERIFY_SERVICE',
        details: `Service "${id}" verified status set to ${Boolean(isVerified)}`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, isVerified: Boolean(isVerified) });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to verify service' });
    }
  });

  // 5. Admin Delete Service Listing
  app.delete('/api/admin/services/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer.from('services').delete().eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: 'DELETE_SERVICE',
        details: `Service listing "${id}" removed by admin`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, deleted: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete service' });
    }
  });

  // 6. Admin Users / Providers Management
  app.get('/api/admin/users', requireAdminAuth, async (req, res) => {
    try {
      if (!supabaseServer) return res.status(200).json({ users: [] });
      const { data, error } = await supabaseServer
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json({ users: data || [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch users' });
    }
  });

  // 7. Admin Toggle User / Provider Verification Badge
  app.post('/api/admin/users/:id/toggle-verify', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { isVerified } = req.body;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer
          .from('profiles')
          .update({ is_verified: Boolean(isVerified) })
          .eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: isVerified ? 'VERIFY_USER' : 'UNVERIFY_USER',
        details: `User/Provider "${id}" verification changed to ${Boolean(isVerified)}`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, isVerified });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update user' });
    }
  });

  // 7b. Admin Toggle User Ban Status
  app.post('/api/admin/users/:id/toggle-ban', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const { isBanned, reason } = req.body;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer
          .from('profiles')
          .update({ is_banned: Boolean(isBanned) })
          .eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: isBanned ? 'BAN_USER' : 'UNBAN_USER',
        details: `User "${id}" ban status set to ${Boolean(isBanned)}${reason ? ` (Reason: ${reason})` : ''}`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, isBanned: Boolean(isBanned) });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to update user ban status' });
    }
  });

  // 8. Admin Community Requests Management
  app.get('/api/admin/requests', requireAdminAuth, async (req, res) => {
    try {
      if (!supabaseServer) return res.status(200).json({ requests: [] });
      const { data, error } = await supabaseServer
        .from('needs')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.status(200).json({ requests: data || [] });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to fetch requests' });
    }
  });

  // 9. Admin Delete Community Request (Spam / Inappropriate)
  app.delete('/api/admin/requests/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const adminEmail = (req as any).adminEmail;

    try {
      if (supabaseServer) {
        await supabaseServer.from('needs').delete().eq('id', id);
      }

      adminAuditLogs.unshift({
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        adminEmail,
        action: 'DELETE_REQUEST',
        details: `Community request "${id}" removed by admin`,
        targetId: id
      });

      res.status(200).json({ status: 'ok', id, deleted: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Failed to delete request' });
    }
  });

  // 10. Admin Audit Logs
  app.get('/api/admin/audit-logs', requireAdminAuth, (req, res) => {
    res.status(200).json({ logs: adminAuditLogs });
  });

  // Server-side Gemini AI route
  app.post('/api/enhance-listing', async (req, res) => {
    try {
      const { type, roughTitle, category, conditionOrSkill, userNotes } = req.body || {};
      const ai = getAI();
      if (!ai) {
        return res.status(503).json({ error: 'GEMINI_API_KEY not configured on server' });
      }

      const prompt = `You are an expert copywriter and marketplace consultant for "Needly", a hyperlocal product rental and local service marketplace.
A user wants to list a ${type === 'product' ? 'product for rent' : 'service for hire'}.
User input:
- Title/Item: ${roughTitle || ''}
- Category: ${category || ''}
- ${type === 'product' ? 'Condition' : 'Skills/Focus'}: ${conditionOrSkill || ''}
- Notes: ${userNotes || ''}

Respond ONLY with valid JSON adhering to this exact format:
{
  "title": "A crisp, catchy, professional title (under 75 chars)",
  "description": "2-3 engaging, clear sentences explaining what is included, who it is ideal for, and high reliability",
  "suggestedPrice": 499,
  "features": ["3 to 4 standout bullet points highlighting specs, attachments, or capabilities"],
  "tips": ["1 or 2 safety or handover tips for owner"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = response.text || '{}';
      const parsed = JSON.parse(text);
      res.json(parsed);
    } catch (err: any) {
      console.error('Server Gemini enhance error:', err);
      res.status(500).json({ error: err?.message || 'Failed to enhance listing' });
    }
  });

  // Helper to escape HTML attributes for safe meta tag injection
  function escapeHtml(str: string): string {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Fallback metadata dictionary for pre-seeded service items
  const FALLBACK_SERVICE_META: Record<string, { title: string; providerName: string; description: string; image: string }> = {
    serv_1: {
      title: 'Complete Home Deep Cleaning & Sanitization',
      providerName: 'Kailash Meena',
      description: 'Professional full-home sanitization, kitchen degreasing, bathroom descaling, and balcony wash using eco-safe supplies.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80',
    },
    serv_1b: {
      title: 'Emergency Electrical Repair & Switchboard Wiring',
      providerName: 'Ramesh Sharma',
      description: 'Quick 30-min response for short circuits, MCB tripping, inverter wiring, and electrical appliance installations in Udaipur.',
      image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&auto=format&fit=crop&q=80',
    },
    serv_2: {
      title: 'Expert Plumbing & Pipe Leakage Repair',
      providerName: 'Dinesh Kumar',
      description: 'Fix dripping taps, concealed pipe leakages, water heater fittings, and motor connection problems across Udaipur.',
      image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=1200&auto=format&fit=crop&q=80',
    },
    serv_3: {
      title: 'AC Service, Jet Cleaning & Gas Refill',
      providerName: 'Vikram Joshi',
      description: 'Split & window AC thorough foam wash, filter cleaning, cooling coil deep clean, and refrigerant gas top-up.',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=1200&auto=format&fit=crop&q=80',
    },
    serv_4: {
      title: 'Carpentry, Furniture Assembly & Door Lock Fitting',
      providerName: 'Sunil Suthar',
      description: 'Custom woodworking, modular wardrobe assembly, hinge repairs, and digital smart door lock installations.',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&auto=format&fit=crop&q=80',
    },
  };

  async function resolveServiceMeta(serviceId: string, canonicalOrigin: string) {
    let title = 'Needly mobile10 — Everything You Need. Right Around You.';
    let description = 'Hyperlocal marketplace mobile application for discovering and booking verified local services.';
    let image = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&auto=format&fit=crop&q=80';
    const canonicalUrl = `${canonicalOrigin}/service/${encodeURIComponent(serviceId)}`;
    let exists = false;

    // 1. Try Supabase lookup
    if (supabaseServer) {
      try {
        const { data, error } = await supabaseServer
          .from('services')
          .select('id, title, description, images, starting_price, unit, provider_name, service_area, location, available')
          .eq('id', serviceId)
          .maybeSingle();

        if (data && !error && data.available !== false) {
          exists = true;
          title = `${data.title} by ${data.provider_name} — Needly`;
          const priceStr = data.starting_price ? ` (from ₹${data.starting_price})` : '';
          const locationStr = data.service_area || data.location?.area || 'Udaipur';
          description = data.description
            ? `${data.description.slice(0, 140)}... Available in ${locationStr}${priceStr}. Book verified services on Needly.`
            : `Book ${data.title} by ${data.provider_name} in ${locationStr} on Needly.`;
          if (Array.isArray(data.images) && data.images.length > 0) {
            image = data.images[0];
          }
        }
      } catch (err) {
        console.warn('[Server] Supabase service lookup warning:', err);
      }
    }

    // 2. Fallback to mock dictionary
    if (!exists && FALLBACK_SERVICE_META[serviceId]) {
      const fb = FALLBACK_SERVICE_META[serviceId];
      exists = true;
      title = `${fb.title} by ${fb.providerName} — Needly`;
      description = `${fb.description} Book verified local services in Udaipur on Needly.`;
      image = fb.image;
    }

    if (!exists) {
      title = 'Service Not Available — Needly';
      description = 'This service listing is no longer active, has expired, or is unavailable on Needly.';
    }

    return { title, description, image, url: canonicalUrl, exists };
  }

  function injectOpenGraphTags(rawHtml: string, meta: { title: string; description: string; image: string; url: string }) {
    let html = rawHtml;
    // Update title
    html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(meta.title)}</title>`);
    
    // Update meta description
    if (html.includes('<meta name="description"')) {
      html = html.replace(/<meta\s+name=["']description["'][^>]*>/i, `<meta name="description" content="${escapeHtml(meta.description)}" />`);
    } else {
      html = html.replace('</head>', `    <meta name="description" content="${escapeHtml(meta.description)}" />\n  </head>`);
    }

    // Replace or insert og:title
    if (html.includes('property="og:title"')) {
      html = html.replace(/<meta\s+property=["']og:title["'][^>]*>/i, `<meta property="og:title" content="${escapeHtml(meta.title)}" />`);
    } else {
      html = html.replace('</head>', `    <meta property="og:title" content="${escapeHtml(meta.title)}" />\n  </head>`);
    }

    // Replace or insert og:description
    if (html.includes('property="og:description"')) {
      html = html.replace(/<meta\s+property=["']og:description["'][^>]*>/i, `<meta property="og:description" content="${escapeHtml(meta.description)}" />`);
    } else {
      html = html.replace('</head>', `    <meta property="og:description" content="${escapeHtml(meta.description)}" />\n  </head>`);
    }

    // Insert og:image and og:url and twitter card tags
    const extraTags = [
      `<meta property="og:image" content="${escapeHtml(meta.image)}" />`,
      `<meta property="og:url" content="${escapeHtml(meta.url)}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta name="twitter:card" content="summary_large_image" />`,
      `<meta name="twitter:title" content="${escapeHtml(meta.title)}" />`,
      `<meta name="twitter:description" content="${escapeHtml(meta.description)}" />`,
      `<meta name="twitter:image" content="${escapeHtml(meta.image)}" />`,
    ].join('\n    ');

    html = html.replace('</head>', `    ${extraTags}\n  </head>`);
    return html;
  }

  // Public API to retrieve individual service listing (sanitized public fields only)
  app.get('/api/public/service/:serviceId', async (req, res) => {
    try {
      const serviceId = req.params.serviceId;
      if (!serviceId) {
        return res.status(400).json({ error: 'serviceId parameter required' });
      }

      if (supabaseServer) {
        const { data, error } = await supabaseServer
          .from('services')
          .select('id, title, category, subcategory, description, images, provider_id, provider_name, provider_avatar, provider_rating, provider_review_count, is_provider_verified, starting_price, unit, service_area, location, distance_km, available, skills, packages, jobs_completed, created_at')
          .eq('id', serviceId)
          .maybeSingle();

        if (data && !error) {
          return res.json({ service: data });
        }
      }

      // Check mock fallback
      if (FALLBACK_SERVICE_META[serviceId]) {
        return res.json({
          service: {
            id: serviceId,
            title: FALLBACK_SERVICE_META[serviceId].title,
            description: FALLBACK_SERVICE_META[serviceId].description,
            images: [FALLBACK_SERVICE_META[serviceId].image],
            providerName: FALLBACK_SERVICE_META[serviceId].providerName,
            available: true
          }
        });
      }

      return res.status(404).json({ error: 'Service not found or unavailable' });
    } catch (err: any) {
      console.error('[Server] /api/public/service error:', err);
      res.status(500).json({ error: 'Failed to fetch public service details' });
    }
  });

  // Vite middleware for development vs static serve for production
  let viteDevServer: any = null;
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    viteDevServer = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });

    // Public /service/:serviceId route in development with dynamic Open Graph metadata
    app.get('/service/:serviceId', async (req, res, next) => {
      try {
        const serviceId = req.params.serviceId;
        const origin = `${req.protocol}://${req.get('host')}`;
        const meta = await resolveServiceMeta(serviceId, origin);

        const indexPath = path.join(process.cwd(), 'index.html');
        if (!fs.existsSync(indexPath)) return next();

        let rawHtml = fs.readFileSync(indexPath, 'utf-8');
        let htmlWithMeta = injectOpenGraphTags(rawHtml, meta);
        htmlWithMeta = await viteDevServer.transformIndexHtml(req.originalUrl, htmlWithMeta);

        res.status(meta.exists ? 200 : 404).set({ 'Content-Type': 'text/html' }).send(htmlWithMeta);
      } catch (err) {
        console.error('[Server] Dev /service/:serviceId error:', err);
        next();
      }
    });

    app.use(viteDevServer.middlewares);
  } else {
    const distPath = fs.existsSync(path.join(process.cwd(), 'dist', 'index.html'))
      ? path.join(process.cwd(), 'dist')
      : path.join(process.cwd());

    // Public /service/:serviceId route in production with dynamic Open Graph metadata
    app.get('/service/:serviceId', async (req, res, next) => {
      try {
        const serviceId = req.params.serviceId;
        const origin = `${req.protocol}://${req.get('host')}`;
        const meta = await resolveServiceMeta(serviceId, origin);

        const indexPath = path.join(distPath, 'index.html');
        if (!fs.existsSync(indexPath)) return next();

        const rawHtml = fs.readFileSync(indexPath, 'utf-8');
        const htmlWithMeta = injectOpenGraphTags(rawHtml, meta);

        res.status(meta.exists ? 200 : 404).set({ 'Content-Type': 'text/html' }).send(htmlWithMeta);
      } catch (err) {
        console.error('[Server] Prod /service/:serviceId error:', err);
        next();
      }
    });

    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send('<!doctype html><html><head><title>Needly</title></head><body><div id="root"></div></body></html>');
      }
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (env: ${process.env.NODE_ENV || 'development'})`);
  });

  server.on('error', (err: any) => {
    console.error('Server listen error:', err);
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing server');
    clearInterval(expireInterval);
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

startServer();
