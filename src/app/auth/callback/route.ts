import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Обработчик стандартной магической ссылки Supabase (PKCE-flow):
// письмо ведёт на /auth/callback?code=… — обмениваем код на сессию.
// Важно: ссылка сработает на том же устройстве/браузере, где запросили вход.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const nextParam = searchParams.get("next") ?? "/profile";
  const next = nextParam.startsWith("/") ? nextParam : "/profile";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) redirect(next);
  }

  redirect("/login?error=link");
}
