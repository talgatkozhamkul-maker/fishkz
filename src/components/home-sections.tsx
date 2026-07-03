import Link from "next/link";
import { ChevronRight, Fish, MapPin, Megaphone } from "lucide-react";
import { ListingCard } from "@/components/listing-card";
import { pluralRu } from "@/lib/format";
import type { FishSpecies, ListingWithRelations, Region } from "@/lib/types";

// Контент «шторки» на главной: виды рыб, регионы, свежие объявления, правила.
// Серверный компонент — рендерится в HTML (SEO), показывается внутри панели.
export function HomeSections({
  regions,
  counts,
  species,
  listings,
}: {
  regions: Region[];
  counts: Record<string, number>;
  species: FishSpecies[];
  listings: ListingWithRelations[];
}) {
  return (
    <div className="flex flex-col gap-6 pt-2">
      <section aria-labelledby="fish-heading">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 id="fish-heading" className="flex items-center gap-2 font-extrabold tracking-tight">
            <Fish size={18} aria-hidden className="text-teal-700" />
            Что ловить
          </h2>
          <Link href="/fish" className="flex items-center py-1 text-sm font-semibold text-teal-700 hover:text-teal-900">
            Все виды <ChevronRight size={15} aria-hidden />
          </Link>
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
          {species
            .filter((s) => s.slug !== "osetr")
            .map((s) => (
              <Link
                key={s.id}
                href={`/fish/${s.slug}`}
                className="shrink-0 rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:ring-teal-400"
              >
                {s.name}
              </Link>
            ))}
        </div>
      </section>

      <section aria-labelledby="regions-heading">
        <h2 id="regions-heading" className="mb-2.5 flex items-center gap-2 font-extrabold tracking-tight">
          <MapPin size={18} aria-hidden className="text-teal-700" />
          Регионы
        </h2>
        <ul className="flex flex-col gap-1.5">
          {regions.map((region) => {
            const count = counts[region.id] ?? 0;
            return (
              <li key={region.id}>
                <Link
                  href={`/regions/${region.slug}`}
                  className="flex min-h-12 items-center justify-between gap-2 rounded-xl bg-white px-3.5 py-2.5 ring-1 ring-stone-200 transition hover:ring-teal-400"
                >
                  <span className="text-sm font-semibold text-stone-800">
                    {region.name}
                  </span>
                  <span className="shrink-0 rounded-full bg-stone-100 px-2 py-0.5 text-xs font-bold text-stone-500">
                    {count > 0 ? count : "скоро"}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="listings-heading">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 id="listings-heading" className="flex items-center gap-2 font-extrabold tracking-tight">
            <Megaphone size={18} aria-hidden className="text-teal-700" />
            Свежие объявления
          </h2>
          <Link href="/board" className="flex items-center py-1 text-sm font-semibold text-teal-700 hover:text-teal-900">
            Все <ChevronRight size={15} aria-hidden />
          </Link>
        </div>
        {listings.length === 0 ? (
          <p className="rounded-xl bg-white p-3.5 text-sm text-stone-500 ring-1 ring-stone-200">
            Объявлений пока нет —{" "}
            <Link href="/board/new" className="font-semibold text-teal-700 underline">
              разместите первым
            </Link>
            .
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <h2 className="font-extrabold text-amber-900">
          ⚠️ Не забудьте про нерестовый запрет
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-amber-800">
          Весной действуют ограничения лова, на закреплённых водоёмах нужна
          путёвка.
        </p>
        <Link
          href="/pages/rules"
          className="mt-2.5 inline-flex min-h-10 items-center rounded-xl bg-amber-500 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-amber-600"
        >
          Читать правила
        </Link>
      </section>
    </div>
  );
}
