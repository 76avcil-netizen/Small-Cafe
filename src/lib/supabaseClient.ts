import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = readEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = readEnv('VITE_SUPABASE_ANON_KEY');
const supabaseKeyType = getSupabaseKeyType(supabaseAnonKey);
const supabaseKeyDotCount = countDots(supabaseAnonKey);
const supabaseConfigError = getSupabaseConfigError(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = supabaseConfigError === null;

export const supabaseDiagnostics = {
  configured: isSupabaseConfigured,
  keyType: supabaseKeyType,
  keyLength: supabaseAnonKey.length,
  dotCount: supabaseKeyDotCount,
};

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error(supabaseConfigError ?? 'Supabase is not configured.');
  }

  return supabase;
}

export function getSafeSupabaseErrorDetails(error: unknown) {
  const safeError = error as { message?: unknown; code?: unknown; status?: unknown };
  const parts = [
    typeof safeError.message === 'string' ? safeError.message : 'Bilinmeyen Supabase hatası',
    typeof safeError.code === 'string' ? `code: ${safeError.code}` : null,
    typeof safeError.status === 'number' || typeof safeError.status === 'string' ? `status: ${safeError.status}` : null,
  ].filter(Boolean);

  return parts.join(' | ');
}

function readEnv(key: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY') {
  const value = import.meta.env[key];
  return normalizeViteEnvValue(value);
}

function normalizeViteEnvValue(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().replace(/^["']|["']$/g, '').trim();
}

function getSupabaseConfigError(url: string, anonKey: string) {
  if (!url) {
    return 'Missing VITE_SUPABASE_URL. Set it in .env.local and restart the Vite dev server.';
  }

  if (!anonKey) {
    return 'Missing VITE_SUPABASE_ANON_KEY. Set it in .env.local and restart the Vite dev server.';
  }

  if (!isSupabaseUrl(url)) {
    return 'Invalid VITE_SUPABASE_URL. Use the Project URL from Supabase Project Settings > API.';
  }

  if (anonKey.startsWith('sb_secret_')) {
    return 'Invalid Supabase frontend key. Secret or service_role keys must never be used in the browser.';
  }

  if (supabaseKeyType === 'unknown') {
    return 'Invalid VITE_SUPABASE_ANON_KEY. Use the anon public key for this Supabase project.';
  }

  return null;
}

function isSupabaseUrl(url: string) {
  return url.startsWith('https://') && url.includes('.supabase.co');
}

function getSupabaseKeyType(key: string) {
  if (key.startsWith('sb_publishable_')) {
    return 'publishable';
  }

  if (countDots(key) === 2) {
    return 'legacy-jwt';
  }

  return 'unknown';
}

function countDots(value: string) {
  return (value.match(/\./g) ?? []).length;
}
