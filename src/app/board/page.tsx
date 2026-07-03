import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { getRegions } from "@/lib/data";
import { createStaticClient } from "@/lib/supabase/static";
import type { ListingCategory, ListingWithRelations } from "@/lib/types";

export const metadata: Metadata = {
  title: "Объявления: путёвки, гиды, туры",
  description:
    "Доска объявлений для рыбаков Казахстана: путёвки на водоёмы, гиды, туры, базы отдыха, попутчики.",
};

type Props = {
  searchParams: Promise<{ category?: string; region?: string }>;
};

const CATEGORY_KEYS = Object.keys(LISTING_CATEGORIES) as ListingCategory[];

export default async function BoardPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = CATEGORY_KEYS.includes(params.category as ListingCategory)
    ? (params.category as ListingCategory)
    : null;

  const regions = await getRegions();
  const region = regions.find((r) => r.slug === params.region) ?? null;

  const supabase = createStaticClient();
  let q = supabase
    .from("listings")
    .select(
      "id, author_id, category, title, description, price, price_unit, region_id, water_body_id, photos, contact_phone, contact_whatsapp, contact_telegram, kaspi_link, status, created_at, regions(name, slug), water_bodies(name, slug)",
    )
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(60);
  if (category) q = q.eq("category", category);
  if (region) q = q.eq("region_id", region.id);

  const { data, error } = await q;
  if (error) throw new Error(`Ошибка загрузки объявлений: ${error.message}`);
  const listings = (data ?? []) as unknown as ListingWithRelations[];

  const filterHref = (c: ListingCategory | null, r: string | null) => {
    const sp = new URLSearchParams();
    if (c) sp.set("category", c);
    if (r) sp.set("region", r);
    const qs = sp.toString();
    return qs ? `/board?${qs}` : "/board";
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight">Объявления</h1>
        <Link
          href="/board/new"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          <Plus size={17} aria-hidden />
          Разместить
        </Link>
      </div>

      {/* Фильтр по категории */}
      <div className="no-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4">
        <Link
          href={filterHref(null, region?.slug ?? null)}
          className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
            !category
              ? "bg-teal-700 text-white ring-teal-700"
              : "bg-white text-stone-600 ring-stone-200 hover:ring-teal-400"
          }`}
        >
          Все
        </Link>
        {CATEGORY_KEYS.map((c) => (
          <Link
            key={c}
            href={filterHref(category === c ? null : c, region?.slug ?? null)}
            className={`shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold ring-1 transition ${
              category === c
                ? "bg-teal-700 text-white ring-teal-700"
                : "bg-white text-stone-600 ring-stone-200 hover:ring-teal-400"
            }`}
          >
            {LISTING_CATEGORIES[c].plural}
          </Link>
        ))}
      </div>

      {/* Фильтр по региону (GET-форма — работает без JS) */}
      <form action="/board" className="flex items-center gap-2">
        {category && <input type="hidden" name="category" value={category} />}
        <select
          name="region"
          defaultValue={region?.slug ?? ""}
          aria-label="Фильтр по региону"
          className="h-11 flex-1 rounded-xl border-0 bg-white px-3 text-sm font-medium text-stone-700 ring-1 ring-stone-200 focus:ring-2 focus:ring-teal-500"
        >
          <option value="">Все регионы</option>
          {regions.map((r) => (
            <option key={r.id} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="h-11 rounded-xl bg-white px-4 text-sm font-bold text-teal-700 ring-1 ring-stone-200 transition hover:ring-teal-400"
        >
          Показать
        </button>
      </form>

      {listings.length === 0 ? (
        <EmptyState emoji="📣" title="По этим фильтрам объявлений нет">
          <Link href="/board/new" className="font-semibold text-teal-700 underline">
            Разместите первым
          </Link>{" "}
          — это бесплатно.
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  );
}
