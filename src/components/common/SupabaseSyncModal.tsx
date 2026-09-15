import React, { useState } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  UploadCloud, 
  Check, 
  X, 
  Server, 
  Layers,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { 
  SUPABASE_PROJECT_ID, 
  SUPABASE_SQL_EDITOR_URL, 
  SUPABASE_DASHBOARD_URL 
} from '../../lib/supabase';
import { useApp } from '../../context/AppContext';

interface SupabaseSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSyncModal: React.FC<SupabaseSyncModalProps> = ({ isOpen, onClose }) => {
  const { 
    supabaseStatus, 
    checkDatabaseStatus, 
    syncDataToSupabase, 
    fetchFromSupabase,
    products, 
    services, 
    needs, 
    requests, 
    bookings, 
    reviews, 
    conversations 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'sync' | 'sql'>('sync');
  const [copySuccess, setCopySuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<{
    success: boolean;
    message: string;
    details?: Record<string, number>;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopySql = async () => {
    try {
      // Fetch or use raw schema
      const sqlContent = `-- NEEDLY SUPABASE SCHEMA
-- Run this in Supabase SQL Editor: ${SUPABASE_SQL_EDITOR_URL}

CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar TEXT,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_verified BOOLEAN DEFAULT true,
  rating NUMERIC(3, 2) DEFAULT 5.0,
  review_count INTEGER DEFAULT 0,
  member_since TEXT,
  bio TEXT,
  response_rate TEXT DEFAULT '100%',
  active_role TEXT DEFAULT 'both',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  condition TEXT NOT NULL DEFAULT 'good',
  images TEXT[] DEFAULT '{}',
  owner_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  owner_name TEXT NOT NULL,
  owner_avatar TEXT,
  owner_rating NUMERIC(3, 2) DEFAULT 5.0,
  owner_review_count INTEGER DEFAULT 0,
  is_owner_verified BOOLEAN DEFAULT true,
  price_per_unit NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'day',
  security_deposit NUMERIC(10, 2) DEFAULT 0,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  distance_km NUMERIC(6, 2) DEFAULT 1.0,
  available BOOLEAN DEFAULT true,
  features TEXT[] DEFAULT '{}',
  rules TEXT[] DEFAULT '{}',
  times_rented INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  provider_id TEXT REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_avatar TEXT,
  provider_rating NUMERIC(3, 2) DEFAULT 5.0,
  provider_review_count INTEGER DEFAULT 0,
  is_provider_verified BOOLEAN DEFAULT true,
  starting_price NUMERIC(10, 2) NOT NULL,
  unit TEXT NOT NULL DEFAULT 'visit',
  service_area TEXT DEFAULT 'Udaipur City',
  location JSONB DEFAULT '{}'::jsonb,
  distance_km NUMERIC(6, 2) DEFAULT 1.0,
  available BOOLEAN DEFAULT true,
  skills TEXT[] DEFAULT '{}',
  packages JSONB DEFAULT '[]'::jsonb,
  jobs_completed INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.needs (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL DEFAULT 'product',
  category TEXT NOT NULL,
  subcategory TEXT,
  budget NUMERIC(10, 2) DEFAULT 0,
  needed_date TEXT,
  location JSONB NOT NULL DEFAULT '{}'::jsonb,
  responses_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.rental_requests (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  renter_id TEXT NOT NULL,
  renter_name TEXT NOT NULL,
  renter_avatar TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  total_days INTEGER NOT NULL DEFAULT 1,
  daily_rate NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  security_deposit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  pickup_preference TEXT NOT NULL DEFAULT 'pickup',
  delivery_address TEXT,
  customer_note TEXT,
  has_reviewed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_bookings (
  id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL,
  listing_title TEXT NOT NULL,
  listing_image TEXT,
  provider_id TEXT NOT NULL,
  provider_name TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_avatar TEXT,
  scheduled_date TEXT NOT NULL,
  scheduled_time TEXT NOT NULL,
  package_name TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0,
  service_address TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  customer_notes TEXT,
  has_reviewed BOOLEAN DEFAULT false,
  terms_acknowledged BOOLEAN NOT NULL DEFAULT true,
  terms_version TEXT NOT NULL DEFAULT 'service_request_terms_v1',
  acknowledged_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.service_terms_acknowledgements (
  id TEXT PRIMARY KEY,
  request_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  terms_acknowledged BOOLEAN NOT NULL DEFAULT true,
  terms_version TEXT NOT NULL DEFAULT 'service_request_terms_v1',
  acknowledged_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id TEXT PRIMARY KEY,
  transaction_id TEXT,
  listing_id TEXT,
  listing_title TEXT,
  target_user_id TEXT,
  author_id TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 5.0,
  comment TEXT NOT NULL,
  item_type TEXT NOT NULL DEFAULT 'product',
  verified_rental BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversations (
  id TEXT PRIMARY KEY,
  listing_id TEXT,
  listing_title TEXT,
  listing_image TEXT,
  listing_price TEXT,
  item_type TEXT DEFAULT 'product',
  participant_ids TEXT[] NOT NULL DEFAULT '{}',
  other_user JSONB NOT NULL DEFAULT '{}'::jsonb,
  last_message TEXT,
  last_message_time TEXT,
  unread_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id TEXT NOT NULL,
  text TEXT NOT NULL,
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  attachment_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.wishlists (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  listing_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);

-- Open access policies for development
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.needs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rental_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_terms_acknowledgements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all products" ON public.products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all services" ON public.services FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all needs" ON public.needs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all rental_requests" ON public.rental_requests FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all service_bookings" ON public.service_bookings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all service_terms_acknowledgements" ON public.service_terms_acknowledgements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all reviews" ON public.reviews FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all wishlists" ON public.wishlists FOR ALL USING (true) WITH CHECK (true);
`;
      await navigator.clipboard.writeText(sqlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
    } catch {
      alert('Could not auto-copy. Please check supabase_schema.sql at root.');
    }
  };

  const handleTestConnection = async () => {
    setIsChecking(true);
    await checkDatabaseStatus();
    setIsChecking(false);
  };

  const handlePushData = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const res = await syncDataToSupabase();
    setIsSyncing(false);
    if (res.success) {
      setSyncFeedback({
        success: true,
        message: 'All local data was successfully uploaded and synced to your Supabase PostgreSQL database!',
        details: res.inserted,
      });
    } else {
      setSyncFeedback({
        success: false,
        message: res.errors.join(' | ') || 'Some tables could not be written. Ensure the SQL schema has been executed.',
      });
    }
  };

  const handlePullData = async () => {
    setIsChecking(true);
    await fetchFromSupabase();
    setIsChecking(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-200">
      <div 
        id="supabase-sync-modal" 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 text-white p-4.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Database className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-normal text-base text-white">Supabase Cloud Database</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  {SUPABASE_PROJECT_ID}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">PostgreSQL Backend &amp; Realtime Sync</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Card */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${supabaseStatus?.tablesExist ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${supabaseStatus?.tablesExist ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <div>
              <div className="text-xs font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                {supabaseStatus?.tablesExist ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Connected &amp; Live on Supabase</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tables Required in Supabase</span>
                  </>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                {supabaseStatus?.details || 'Testing database connection...'}
              </p>
            </div>
          </div>

          <button
            onClick={handleTestConnection}
            disabled={isChecking}
            className="px-2.5 py-1 text-[11px] font-normal text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center gap-1 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin' : ''}`} />
            <span>Check</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 gap-2 text-xs font-normal">
          <button
            onClick={() => setActiveTab('sync')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Transfer &amp; Sync Data</span>
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Database Setup SQL</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Stats Summary */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-normal text-slate-900 dark:text-white">{products.length}</div>
                  <div className="text-[10px] text-slate-500">Products</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-normal text-slate-900 dark:text-white">{services.length}</div>
                  <div className="text-[10px] text-slate-500">Services</div>
                </div>
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-center">
                  <div className="text-sm font-normal text-slate-900 dark:text-white">{needs.length}</div>
                  <div className="text-[10px] text-slate-500">Community Needs</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  id="push-to-supabase-btn"
                  onClick={handlePushData}
                  disabled={isSyncing}
                  className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-normal text-xs rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                  <span>{isSyncing ? 'Uploading All Data to Supabase...' : 'Transfer All App Data to Supabase'}</span>
                </button>

                <button
                  onClick={handlePullData}
                  disabled={isChecking}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-normal text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin' : ''}`} />
                  <span>Fetch &amp; Refresh Latest from Supabase</span>
                </button>
              </div>

              {/* Feedback Message */}
              {syncFeedback && (
                <div className={`p-3 rounded-xl border text-xs ${
                  syncFeedback.success 
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
                    : 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}>
                  <div className="font-normal flex items-center gap-1.5 mb-1">
                    {syncFeedback.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-amber-600" />}
                    <span>{syncFeedback.success ? 'Data Transferred Successfully' : 'Action Required'}</span>
                  </div>
                  <p className="leading-relaxed">{syncFeedback.message}</p>
                  {syncFeedback.details && (
                    <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/60 grid grid-cols-2 gap-1 text-[11px] font-mono">
                      {Object.entries(syncFeedback.details).map(([k, v]) => (
                        <div key={k}>✓ {k}: {v} rows</div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Guidance on Setup */}
              {!supabaseStatus?.tablesExist && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-normal text-amber-900 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>First-Time Supabase Setup (30 Seconds)</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400 leading-relaxed">
                    Because this Supabase project is brand new and empty, PostgreSQL requires the database tables to be created once. Click the <strong>Database Setup SQL</strong> tab above or click below to copy the SQL script and run it in the Supabase SQL Editor.
                  </p>
                  <button
                    onClick={() => setActiveTab('sql')}
                    className="text-xs font-normal text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                  >
                    <span>View 1-Click SQL Script</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3.5">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-normal text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>How to apply this schema to your Supabase project:</span>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                  <li>Click <strong>Copy Full SQL Script</strong> below.</li>
                  <li>Click <strong>Open Supabase SQL Editor</strong> to open your project dashboard.</li>
                  <li>Paste the SQL script and press <strong>RUN</strong>.</li>
                  <li>Return here and click <strong>Check &amp; Transfer Data</strong>.</li>
                </ol>
              </div>

              {/* Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex-1 py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-normal text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'Copied to Clipboard!' : 'Copy Full SQL Script'}</span>
                </button>

                <a
                  href={SUPABASE_SQL_EDITOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:opacity-90 text-white font-normal text-xs rounded-xl flex items-center gap-1.5 transition-colors"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Code Preview */}
              <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950 text-slate-300 font-mono text-[10px] p-3 max-h-56 overflow-y-auto">
                <pre>{`-- Tables: profiles, products, services, needs, rental_requests,
-- service_bookings, reviews, conversations, messages, wishlists
-- Row Level Security policies enabled for all tables
-- Realtime publication configured

CREATE TABLE public.profiles (...);
CREATE TABLE public.products (...);
CREATE TABLE public.services (...);
CREATE TABLE public.needs (...);
CREATE TABLE public.rental_requests (...);
CREATE TABLE public.service_bookings (...);
CREATE TABLE public.reviews (...);
CREATE TABLE public.conversations (...);
CREATE TABLE public.messages (...);
CREATE TABLE public.wishlists (...);
-- (Click 'Copy Full SQL Script' above for full 200-line code)`}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Project: {SUPABASE_PROJECT_ID}</span>
          <a
            href={SUPABASE_DASHBOARD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
