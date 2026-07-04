import { createClient } from "@supabase/supabase-js";
import { getConfig } from "@/lib/config";

/**
 * Supabase client for server-side operations.
 * Uses service role key for admin operations.
 *
 * DO NOT use this on the client side - use the anon key client instead.
 */

export function getSupabaseAdmin() {
  const config = getConfig();

  return createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client for browser operations.
 * Uses anon key which respects RLS policies.
 */
export function getSupabaseClient() {
  const config = getConfig();

  return createClient(config.supabaseUrl, config.supabaseAnonKey);
}
