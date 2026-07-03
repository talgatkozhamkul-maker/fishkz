import type { WaterType } from "@/lib/types";

/** Лёгкое DTO водоёма для карты (только то, что нужно метке и мини-карточке) */
export type MapWater = {
  id: string;
  name: string;
  slug: string;
  water_type: WaterType;
  lat: number;
  lng: number;
  is_paid: boolean;
  region_name: string | null;
  fish: string[];
};
