import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Анонимный клиент БЕЗ cookies — для публичного каталога, sitemap и всего,
// что должно рендериться статически (ISR). Не трогает request-time API,
// поэтому страницы с ним пререндерятся и кэшируются на CDN.
// Для операций от имени пользователя используйте createClient из ./server.
export function createStaticClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
