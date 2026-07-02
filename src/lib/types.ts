// Типы предметной области. Соответствуют таблицам в supabase/migrations.

export type WaterType = "lake" | "river" | "pond" | "reservoir";

export const WATER_TYPE_LABELS: Record<WaterType, string> = {
  lake: "Озеро",
  river: "Река",
  pond: "Пруд",
  reservoir: "Водохранилище",
};

export type Region = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type WaterBody = {
  id: string;
  region_id: string;
  name: string;
  slug: string;
  description: string | null;
  water_type: WaterType;
  lat: number | null;
  lng: number | null;
  photos: string[];
  is_paid: boolean;
  rules_text: string | null;
  contacts: string | null;
  status: "active" | "hidden";
};

export type Page = {
  slug: string;
  title: string;
  content_md: string;
};
