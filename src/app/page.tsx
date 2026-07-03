import { HomeSections } from "@/components/home-sections";
import { MapHome } from "@/components/map/map-home";
import type { MapWater } from "@/components/map/types";
import {
  getAllWaters,
  getFishSpecies,
  getFreshListings,
  getRegions,
  getWaterCounts,
} from "@/lib/data";

// Главная в стиле 2ГИС: полноэкранная карта с водоёмами и геопозицией,
// поверх — выдвижная панель с поиском, каталогом и объявлениями.
// Страница статическая (ISR); геолокация делается на клиенте (/api/geo + GPS).
export const revalidate = 1800;

export default async function Home() {
  const [waters, regions, counts, species, listings] = await Promise.all([
    getAllWaters(),
    getRegions(),
    getWaterCounts(),
    getFishSpecies(),
    getFreshListings(4),
  ]);

  const mapWaters: MapWater[] = waters
    .filter((w) => w.lat !== null && w.lng !== null)
    .map((w) => ({
      id: w.id,
      name: w.name,
      slug: w.slug,
      water_type: w.water_type,
      lat: w.lat!,
      lng: w.lng!,
      is_paid: w.is_paid,
      region_name: w.regions?.name ?? null,
      fish: w.water_body_fish
        .slice(0, 4)
        .map((f) => f.fish_species.name.replace(/\s*\(.*\)/, "")),
    }));

  return (
    <MapHome waters={mapWaters}>
      <HomeSections
        regions={regions}
        counts={Object.fromEntries(counts)}
        species={species}
        listings={listings}
      />
    </MapHome>
  );
}
