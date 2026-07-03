// Типы предметной области. Соответствуют supabase/migrations/0001_rebuild_schema.sql.

export type WaterType = "lake" | "river" | "pond" | "reservoir";
export type ManagedStatus = "reserved" | "assigned";
export type ListingCategory =
  | "putevka"
  | "guide"
  | "tour"
  | "base"
  | "companion"
  | "service";
export type ListingStatus = "pending" | "active" | "hidden" | "archived";

export type Region = {
  id: string;
  name: string;
  slug: string;
  sort_order: number;
};

export type FishSpecies = {
  id: string;
  name: string;
  slug: string;
  latin: string | null;
  description: string;
  season: string;
  methods: string;
  sort_order: number;
};

export type WaterBody = {
  id: string;
  region_id: string;
  name: string;
  slug: string;
  description: string;
  water_type: WaterType;
  lat: number | null;
  lng: number | null;
  photos: string[];
  is_paid: boolean;
  managed_status: ManagedStatus;
  price_info: string | null;
  season_notes: string | null;
  facilities: string[];
  access_notes: string | null;
  rules_text: string | null;
  contacts: string | null;
  verified_at: string | null;
  status: "active" | "hidden";
};

/** Водоём со связями (вложенные select PostgREST) */
export type WaterBodyWithRelations = WaterBody & {
  regions: Pick<Region, "name" | "slug"> | null;
  water_body_fish: { fish_species: Pick<FishSpecies, "name" | "slug"> }[];
};

export type Listing = {
  id: string;
  author_id: string;
  category: ListingCategory;
  title: string;
  description: string;
  price: number | null;
  price_unit: string | null;
  region_id: string | null;
  water_body_id: string | null;
  photos: string[];
  contact_phone: string | null;
  contact_whatsapp: string | null;
  contact_telegram: string | null;
  kaspi_link: string | null;
  status: ListingStatus;
  created_at: string;
};

export type ListingWithRelations = Listing & {
  regions: Pick<Region, "name" | "slug"> | null;
  water_bodies: Pick<WaterBody, "name" | "slug"> | null;
};

export type Profile = {
  id: string;
  display_name: string;
  phone: string | null;
  is_admin: boolean;
};

export type Page = {
  slug: string;
  title: string;
  content_md: string;
};
