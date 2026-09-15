import { createClient } from '@supabase/supabase-js';

// Both values come from the Supabase dashboard and are safe to ship to the
// browser - access is controlled by the row level security rules in
// supabase/schema.sql, not by keeping these secret.
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(url && key);

export const supabase = isSupabaseConfigured ? createClient(url, key) : null;
