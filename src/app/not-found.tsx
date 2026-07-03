import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div aria-hidden className="text-6xl">
        🎣
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        Сорвалась! Страница не найдена
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-stone-500">
        Такой страницы нет — возможно, водоём переименован или объявление снято
        с публикации.
      </p>
      <div className="mt-2 flex gap-2">
        <Link
          href="/"
          className="inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800"
        >
          На главную
        </Link>
        <Link
          href="/board"
          className="inline-flex min-h-12 items-center rounded-xl bg-white px-5 font-bold text-stone-700 ring-1 ring-stone-200 transition hover:ring-teal-400"
        >
          Объявления
        </Link>
      </div>
    </div>
  );
}
