import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "FishKZ — рыбалка в Казахстане",
    template: "%s — FishKZ",
  },
  description:
    "Каталог водоёмов Казахстана, правила рыбалки и объявления услуг для рыбаков.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-zinc-50 text-zinc-900">
        <header className="border-b border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
            <Link href="/" className="text-lg font-semibold text-sky-700">
              🎣 FishKZ
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-600">
              <Link href="/" className="hover:text-sky-700">
                Регионы
              </Link>
              <Link href="/pages/rules" className="hover:text-sky-700">
                Правила
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
          {children}
        </main>

        <footer className="border-t border-zinc-200 bg-white">
          <div className="mx-auto flex max-w-3xl flex-wrap gap-x-4 gap-y-1 px-4 py-4 text-sm text-zinc-500">
            <Link href="/pages/about" className="hover:text-sky-700">
              О сервисе
            </Link>
            <Link href="/pages/privacy" className="hover:text-sky-700">
              Конфиденциальность
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
