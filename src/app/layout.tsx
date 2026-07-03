import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import Link from "next/link";
import { AuthNav } from "@/components/auth-nav";
import { BottomNav } from "@/components/site-chrome";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/constants";
import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f766e",
  width: "device-width",
  initialScale: 1,
};

function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex min-h-11 items-center gap-2 font-extrabold tracking-tight text-teal-800 focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <rect width="32" height="32" rx="8" fill="#0f766e" />
        <ellipse cx="14" cy="16" rx="8" ry="5" fill="#fff" />
        <path d="M21 16 L27 11.5 V20.5 Z" fill="#fff" />
        <circle cx="10.5" cy="14.8" r="1.2" fill="#0f766e" />
        <path
          d="M4 25 q3 -2 6 0 t6 0 t6 0 t6 0"
          stroke="#99f6e4"
          strokeWidth="1.6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-lg">
        Fish<span className="text-amber-500">KZ</span>
      </span>
    </Link>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`h-full ${manrope.variable} antialiased`}>
      <body className="flex min-h-full flex-col bg-stone-50 font-sans text-stone-900">
        <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-2">
            <Logo />
            <nav
              aria-label="Основное меню"
              className="hidden items-center gap-1 sm:flex"
            >
              <Link href="/fish" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-teal-800">
                Рыба
              </Link>
              <Link href="/board" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-teal-800">
                Объявления
              </Link>
              <Link href="/pages/rules" className="min-h-11 rounded-xl px-3 py-2.5 text-sm font-semibold text-stone-600 transition hover:bg-stone-100 hover:text-teal-800">
                Правила
              </Link>
            </nav>
            <AuthNav />
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-24 pt-5 sm:pb-10">
          {children}
        </main>

        <footer className="mb-14 border-t border-stone-200 bg-white sm:mb-0">
          <div className="mx-auto max-w-3xl px-4 py-6">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-medium text-stone-500">
              <Link href="/pages/about" className="py-1 hover:text-teal-700">
                О сервисе
              </Link>
              <Link href="/pages/rules" className="py-1 hover:text-teal-700">
                Правила рыбалки
              </Link>
              <Link href="/pages/privacy" className="py-1 hover:text-teal-700">
                Конфиденциальность
              </Link>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-400">
              {SITE_NAME} — информационный сервис. Проверяйте действующие
              ограничения лова в территориальной инспекции рыбного хозяйства.
            </p>
          </div>
        </footer>

        <BottomNav />
      </body>
    </html>
  );
}
