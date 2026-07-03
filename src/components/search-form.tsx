import { Search } from "lucide-react";

/** Форма поиска (обычный GET на /search — работает без JS, серверный рендер) */
export function SearchForm({
  defaultValue = "",
  autoFocus = false,
}: {
  defaultValue?: string;
  autoFocus?: boolean;
}) {
  return (
    <form action="/search" role="search" className="relative">
      <Search
        size={18}
        aria-hidden
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-stone-400"
      />
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        required
        minLength={2}
        autoFocus={autoFocus}
        placeholder="Водоём, рыба или регион…"
        aria-label="Поиск по каталогу"
        className="h-12 w-full rounded-2xl border-0 bg-white pl-11 pr-24 text-base text-stone-900 shadow-sm ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
      />
      <button
        type="submit"
        className="absolute right-1.5 top-1/2 h-9 -translate-y-1/2 rounded-xl bg-teal-700 px-4 text-sm font-semibold text-white transition hover:bg-teal-800"
      >
        Найти
      </button>
    </form>
  );
}
