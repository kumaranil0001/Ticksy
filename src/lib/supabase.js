import { createClient } from '@supabase/supabase-js';

// Retrieve credentials from Vite env or user custom storage
export const getSupabaseConfig = () => {
  const envUrl = import.meta.env.VITE_SUPABASE_URL;
  const envKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (envUrl && envKey && !envUrl.includes('your-project-id')) {
    return { url: envUrl, anonKey: envKey, source: 'env' };
  }

  try {
    const customConfig = localStorage.getItem('donestack_supabase_config');
    if (customConfig) {
      const parsed = JSON.parse(customConfig);
      if (parsed.url && parsed.anonKey) {
        return { url: parsed.url, anonKey: parsed.anonKey, source: 'custom' };
      }
    }
  } catch (err) {
    console.warn('Error reading custom Supabase config:', err);
  }

  return { url: '', anonKey: '', source: 'none' };
};

const currentConfig = getSupabaseConfig();

// Fallback dummy credentials to prevent createClient from crashing if unconfigured
const dummyUrl = 'https://xyzcompanyplaceholder.supabase.co';
const dummyKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key_for_client_instantiation';

export const isSupabaseConfigured = () => {
  const conf = getSupabaseConfig();
  return Boolean(conf.url && conf.anonKey && !conf.url.includes('your-project-id') && conf.url.startsWith('https://'));
};

export const supabase = createClient(
  currentConfig.url && isSupabaseConfigured() ? currentConfig.url : dummyUrl,
  currentConfig.anonKey && isSupabaseConfigured() ? currentConfig.anonKey : dummyKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

export const saveSupabaseConfig = (url, anonKey) => {
  localStorage.setItem('donestack_supabase_config', JSON.stringify({ url, anonKey }));
  window.location.reload();
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('donestack_supabase_config');
  window.location.reload();
};
