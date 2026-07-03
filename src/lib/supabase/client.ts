"use client";

import { createBrowserClient } from "@supabase/ssr";

// Клиент Supabase для браузерных (client) компонентов: виджет входа в шапке,
// загрузка фото. Сессия хранится в cookies и разделяется с серверной частью.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
