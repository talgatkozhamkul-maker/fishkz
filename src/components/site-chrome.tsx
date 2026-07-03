"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpenText, Fish, Home, Megaphone } from "lucide-react";

// Нижняя таб-навигация для мобильных (паттерн PWA). Клиентская — подсвечивает
// активный раздел через usePathname.
const TABS = [
  { href: "/", label: "Каталог", icon: Home, match: /^\/($|regions|water|search)/ },
  { href: "/fish", label: "Рыба", icon: Fish, match: /^\/fish/ },
  { href: "/board", label: "Объявления", icon: Megaphone, match: /^\/board/ },
  { href: "/pages/rules", label: "Правила", icon: BookOpenText, match: /^\/pages/ },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Основные разделы"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl">
        {TABS.map(({ href, label, icon: Icon, match }) => {
          const active = match.test(pathname);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-semibold transition ${
                active ? "text-teal-700" : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Icon size={22} aria-hidden strokeWidth={active ? 2.4 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
