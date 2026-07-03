import Link from "next/link";
import { ChevronRight, Fish, MapPin, Megaphone } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { SearchForm } from "@/components/search-form";
import {
  getFishSpecies,
  getFreshListings,
  getRegions,
  getWaterCounts,
} from "@/lib/data";
import { pluralRu } from "@/lib/format";

// Публичный каталог: анонимный клиент без cookies + ISR (вывод аудита).
export const revalidate = 1800;

export default async function Home() {
  const [regions, counts, species, listings] = await Promise.all([
    getRegions(),
    getWaterCounts(),
    getFishSpecies(),
    getFreshListings(6),
  ]);
  const totalWaters = [...counts.values()].reduce((a, b) => a + b, 0);

  return (
    <div className="flex flex-col gap-8">
      {/* Hero + поиск */}
      <section className="-mx-4 -mt-5 bg-gradient-to-b from-teal-800 to-teal-700 px-4 pb-6 pt-8 text-white sm:rounded-b-3xl">
        <h1 className="text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">
          Куда поехать на рыбалку?
        </h1>
        <p className="mt-1.5 text-sm text-teal-100 sm:text-base">
          {totalWaters}{" "}
          {pluralRu(totalWaters, "водоём", "водоёма", "водоёмов")} по всем{" "}
          {regions.length} областям · какая рыба клюёт, правила и цены
        </p>
        <div className="mt-4">
          <SearchForm />
        </div>
      </section>

      {/* Виды рыб */}
      <section aria-labelledby="fish-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="fish-heading" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Fish size={20} aria-hidden className="text-teal-700" />
            Что ловить
          </h2>
          <Link href="/fish" className="flex items-center py-2 text-sm font-semibold text-teal-700 hover:text-teal-900">
            Все виды <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {species
            .filter((s) => s.slug !== "osetr")
            .map((s) => (
              <Link
                key={s.id}
                href={`/fish/${s.slug}`}
                className="shrink-0 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:ring-teal-400"
              >
                {s.name}
              </Link>
            ))}
        </div>
      </section>

      {/* Регионы */}
      <section aria-labelledby="regions-heading">
        <h2 id="regions-heading" className="mb-3 flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <MapPin size={20} aria-hidden className="text-teal-700" />
          Регионы
        </h2>
        <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {regions.map((region) => {
            const count = counts.get(region.id) ?? 0;
            return (
              <li key={region.id}>
                <Link
                  href={`/regions/${region.slug}`}
                  className="flex min-h-14 items-center justify-between gap-2 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200 transition hover:ring-teal-400 focus-visible:outline-2 focus-visible:outline-teal-600"
                >
                  <span className="font-semibold text-stone-800">
                    {region.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2.5 py-1 text-xs font-bold text-stone-500">
                    {count > 0
                      ? `${count} ${pluralRu(count, "водоём", "водоёма", "водоёмов")}`
                      : "скоро"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Свежие объявления */}
      <section aria-labelledby="listings-heading">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 id="listings-heading" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
            <Megaphone size={20} aria-hidden className="text-teal-700" />
            Свежие объявления
          </h2>
          <Link href="/board" className="flex items-center py-2 text-sm font-semibold text-teal-700 hover:text-teal-900">
            Все <ChevronRight size={16} aria-hidden />
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-2xl bg-white p-4 text-sm text-stone-500 ring-1 ring-stone-200">
            Объявлений пока нет —{" "}
            <Link href="/board/new" className="font-semibold text-teal-700 underline">
              разместите первым
            </Link>
            .
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      {/* Тизер правил */}
      <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <h2 className="font-extrabold text-amber-900">
          ⚠️ Не забудьте про нерестовый запрет
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-amber-800">
          Весной на всех бассейнах действуют ограничения лова, а на закреплённых
          водоёмах нужна путёвка. Коротко и по-русски — в нашей памятке.
        </p>
        <Link
          href="/pages/rules"
          className="mt-3 inline-flex min-h-11 items-center rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          Читать правила
        </Link>
      </section>
    </div>
  );
}
