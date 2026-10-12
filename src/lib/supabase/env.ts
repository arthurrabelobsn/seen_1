// Aceita tanto a chave "publishable" (painel novo do Supabase) quanto a "anon" (painel antigo).
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  "";

export const supabaseConfigured = Boolean(supabaseUrl && supabaseKey);
