import { cache } from "react";
import { createStaticClient } from "@/lib/supabase/static";
import type {
  FishSpecies,
  ListingWithRelations,
  Page,
  Region,
  WaterBodyWithRelations,
} from "@/lib/types";

// Доступ к данным каталога. Правила (по аудиту):
// 1) ошибка запроса — это ИСКЛЮЧЕНИЕ (→ error.tsx), а не «не найдено»;
// 2) «не найдено» — это null при успешном запросе (→ notFound() на странице);
// 3) cache() дедуплицирует запросы между generateMetadata и страницей.

function must<T>(data: T | null, error: { message: string } | null): T {
  if (error) throw new Error(`Ошибка запроса к базе: ${error.message}`);
  if (data === null) throw new Error("Ошибка запроса к базе: пустой ответ");
  return data;
}

const WATER_SELECT =
  "id, region_id, name, slug, description, water_type, lat, lng, photos, is_paid, managed_status, price_info, season_notes, facilities, access_notes, rules_text, contacts, verified_at, status, regions(name, slug), water_body_fish(fish_species(name, slug))";

const LISTING_SELECT =
  "id, author_id, category, title, description, price, price_unit, region_id, water_body_id, photos, contact_phone, contact_whatsapp, contact_telegram, kaspi_link, status, created_at, regions(name, slug), water_bodies(name, slug)";

export const getRegions = cache(async (): Promise<Region[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("regions")
    .select("id, name, slug, sort_order")
    .order("sort_order");
  return must(data, error) as Region[];
});

export const getRegionBySlug = cache(
  async (slug: string): Promise<Region | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("regions")
      .select("id, name, slug, sort_order")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Ошибка запроса к базе: ${error.message}`);
    return data as Region | null;
  },
);

export const getWatersByRegion = cache(
  async (regionId: string): Promise<WaterBodyWithRelations[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("water_bodies")
      .select(WATER_SELECT)
      .eq("region_id", regionId)
      .eq("status", "active")
      .order("name");
    return must(data, error) as unknown as WaterBodyWithRelations[];
  },
);

export const getWaterBySlug = cache(
  async (slug: string): Promise<WaterBodyWithRelations | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("water_bodies")
      .select(WATER_SELECT)
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();
    if (error) throw new Error(`Ошибка запроса к базе: ${error.message}`);
    return data as unknown as WaterBodyWithRelations | null;
  },
);

export const getAllWaters = cache(
  async (): Promise<WaterBodyWithRelations[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("water_bodies")
      .select(WATER_SELECT)
      .eq("status", "active")
      .order("name");
    return must(data, error) as unknown as WaterBodyWithRelations[];
  },
);

export const getFishSpecies = cache(async (): Promise<FishSpecies[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("fish_species")
    .select("id, name, slug, latin, description, season, methods, sort_order")
    .order("sort_order");
  return must(data, error) as FishSpecies[];
});

export const getFishBySlug = cache(
  async (slug: string): Promise<FishSpecies | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("fish_species")
      .select("id, name, slug, latin, description, season, methods, sort_order")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Ошибка запроса к базе: ${error.message}`);
    return data as FishSpecies | null;
  },
);

/** Водоёмы, где водится вид (через junction-таблицу) */
export const getWatersByFish = cache(
  async (fishId: string): Promise<WaterBodyWithRelations[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("water_body_fish")
      .select(`water_bodies!inner(${WATER_SELECT})`)
      .eq("fish_id", fishId);
    const rows = must(data, error) as unknown as {
      water_bodies: WaterBodyWithRelations;
    }[];
    return rows
      .map((r) => r.water_bodies)
      .filter((w) => w.status === "active")
      .sort((a, b) => a.name.localeCompare(b.name, "ru"));
  },
);

export const getPageBySlug = cache(
  async (slug: string): Promise<Page | null> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("pages")
      .select("slug, title, content_md")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw new Error(`Ошибка запроса к базе: ${error.message}`);
    return data as Page | null;
  },
);

export const getPages = cache(async (): Promise<Page[]> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("pages")
    .select("slug, title, content_md");
  return must(data, error) as Page[];
});

export const getFreshListings = cache(
  async (limit = 6): Promise<ListingWithRelations[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(limit);
    return must(data, error) as unknown as ListingWithRelations[];
  },
);

export const getListingsByWater = cache(
  async (waterBodyId: string): Promise<ListingWithRelations[]> => {
    const supabase = createStaticClient();
    const { data, error } = await supabase
      .from("listings")
      .select(LISTING_SELECT)
      .eq("status", "active")
      .eq("water_body_id", waterBodyId)
      .order("created_at", { ascending: false })
      .limit(10);
    return must(data, error) as unknown as ListingWithRelations[];
  },
);

/** Счётчик водоёмов по каждому региону (для списка регионов) */
export const getWaterCounts = cache(async (): Promise<Map<string, number>> => {
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("water_bodies")
    .select("region_id")
    .eq("status", "active");
  const rows = must(data, error) as { region_id: string }[];
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.region_id, (counts.get(r.region_id) ?? 0) + 1);
  return counts;
});
