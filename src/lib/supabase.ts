import { createClient } from '@supabase/supabase-js';

const getEnvVar = (name: string): string | undefined => {
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return import.meta.env[name];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[name];
  }
  return undefined;
};

const SUPABASE_URL = 
  getEnvVar('VITE_SUPABASE_URL') || 
  'https://ldivsmoqttphhuwdjszh.supabase.co';

const SUPABASE_ANON_KEY = 
  getEnvVar('VITE_SUPABASE_ANON_KEY') || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkaXZzbW9xdHRwaGh1d2Rqc3poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg1OTUwODAsImV4cCI6MjEwNDE3MTA4MH0.vHKy_SbZkVJOjapYq_BJLO5XRMf14OvViZ_-8nfA1RY';

export const SUPABASE_PROJECT_ID = 'ldivsmoqttphhuwdjszh';
export const SUPABASE_DASHBOARD_URL = 'https://supabase.com/dashboard/project/ldivsmoqttphhuwdjszh';
export const SUPABASE_SQL_EDITOR_URL = 'https://supabase.com/dashboard/project/ldivsmoqttphhuwdjszh/sql/new';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 15,
    },
  },
});
