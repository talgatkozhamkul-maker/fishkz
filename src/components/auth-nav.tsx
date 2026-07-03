"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CircleUserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Клиентский виджет входа в шапке. Сделан клиентским сознательно: если бы
// шапка читала сессию на сервере, ВЕСЬ каталог стал бы динамическим и потерял
// ISR (вывод аудита архитектуры). Здесь сессия подтягивается после гидрации.
export function AuthNav() {
  const [state, setState] = useState<"loading" | "guest" | "user">("loading");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setState(data.user ? "user" : "guest");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setState(session?.user ? "user" : "guest");
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const href = state === "user" ? "/profile" : "/login";
  const label = state === "user" ? "Профиль" : "Войти";

  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      <CircleUserRound size={20} aria-hidden />
      <span className={state === "loading" ? "opacity-50" : ""}>{label}</span>
    </Link>
  );
}
