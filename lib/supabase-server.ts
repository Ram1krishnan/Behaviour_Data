import dns from 'node:dns';
import { createClient } from '@supabase/supabase-js';

// Monkey patch DNS to bypass ISP DNS hijacking (e.g. for users in India)
const originalLookup = dns.lookup;

const patchedLookup = ((hostname: string, options: any, callback: any) => {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  if (hostname.includes('supabase.co')) {
    if (options?.all) {
      return callback(null, [{ address: '104.18.38.10', family: 4 }]);
    }
    return callback(null, '104.18.38.10', 4);
  }

  return originalLookup(hostname, options, callback);
}) as typeof dns.lookup;

// Preserve Node's promisified lookup helper to satisfy types
(patchedLookup as any).__promisify__ = (originalLookup as any).__promisify__;

dns.lookup = patchedLookup;

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Missing Supabase env: set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)'
  );
}

export const supabaseServer = createClient(supabaseUrl, supabaseKey);
