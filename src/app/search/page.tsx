import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { SearchForm } from "@/components/search-form";
import { WaterCard } from "@/components/water-card";
import { createStaticClient } from "@/lib/supabase/static";
import { pluralRu } from "@/lib/format";
import type { WaterBodyWithRelations } from "@/lib/types";

export const metadata: Metadata = {
  title: "Поиск по каталогу",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ q?: string }> };

// Экранирует спецсимволы PostgREST-паттерна (%, _, запятые в or-фильтре)
function sanitize(q: string): string {
  return q.replace(/[%_,()]/g, " ").trim().slice(0, 60);
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const query = sanitize(q);

  let waters: WaterBodyWithRelations[] = [];
  if (query.length >= 2) {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("water_bodies")
      .select(
        "id, region_id, name, slug, description, water_type, lat, lng, photos, is_paid, managed_status, price_info, season_notes, facilities, access_notes, rules_text, contacts, verified_at, status, regions(name, slug), water_body_fish(fish_species(name, slug))",
      )
      .eq("status", "active")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order("name")
      .limit(30);
    if (error) throw new Error(`Ошибка поиска: ${error.message}`);
    waters = (data ?? []) as unknown as WaterBodyWithRelations[];

    // Дополнительно ищем по видам рыб: «судак» → водоёмы, где он клюёт
    const { data: byFish, error: fishError } = await supabase
      .from("fish_species")
      .select(
        "water_body_fish(water_bodies(id, region_id, name, slug, description, water_type, lat, lng, photos, is_paid, managed_status, price_info, season_notes, facilities, access_notes, rules_text, contacts, verified_at, status, regions(name, slug), water_body_fish(fish_species(name, slug))))",
      )
      .ilike("name", `%${query}%`)
      .limit(3);
    if (!fishError && byFish) {
      const seen = new Set(waters.map((w) => w.id));
      for (const fish of byFish as unknown as {
        water_body_fish: { water_bodies: WaterBodyWithRelations }[];
      }[]) {
        for (const link of fish.water_body_fish) {
          const w = link.water_bodies;
          if (w && w.status === "active" && !seen.has(w.id)) {
            seen.add(w.id);
            waters.push(w);
          }
        }
      }
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Поиск</h1>
      <SearchForm defaultValue={q} autoFocus />

      {query.length >= 2 &&
        (waters.length === 0 ? (
          <EmptyState emoji="🔍" title={`По запросу «${query}» ничего не нашлось`}>
            Попробуйте название водоёма («Балхаш»), рыбу («судак») или тип
            («водохранилище»).
          </EmptyState>
        ) : (
          <>
            <p className="text-sm text-stone-500">
              Найдено: {waters.length}{" "}
              {pluralRu(waters.length, "водоём", "водоёма", "водоёмов")}
            </p>
            <div className="flex flex-col gap-2">
              {waters.map((w) => (
                <WaterCard key={w.id} water={w} showRegion />
              ))}
            </div>
          </>
        ))}
    </div>
  );
}
