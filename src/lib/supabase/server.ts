import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Клиент Supabase для серверных компонентов и серверных экшенов.
// Использует публичные ключи (anon) — они безопасны для клиента.
// Управление cookie нужно для авторизации (Фаза 2), для публичного чтения оно
// просто не задействуется.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Вызвано из серверного компонента — запись cookie здесь невозможна.
            // Это нормально: обновлением сессии займётся middleware (Фаза 2).
          }
        },
      },
    },
  );
}
