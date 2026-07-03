import Link from "next/link";
import { PaidBadge, WaterTypeBadge } from "@/components/badges";
import { WaterCover } from "@/components/water-cover";
import type { WaterBodyWithRelations } from "@/lib/types";

export function WaterCard({
  water,
  showRegion = false,
}: {
  water: WaterBodyWithRelations;
  showRegion?: boolean;
}) {
  const fish = water.water_body_fish.map((f) => f.fish_species);
  return (
    <Link
      href={`/water/${water.slug}`}
      className="group flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 transition hover:ring-teal-400 focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      <div className="relative h-24 w-28 shrink-0 overflow-hidden rounded-xl sm:w-36">
        <WaterCover
          type={water.water_type}
          seed={water.slug}
          className="h-full w-full"
        />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <h3 className="mr-auto font-bold leading-snug text-stone-900 group-hover:text-teal-800">
            {water.name}
          </h3>
        </div>
        {showRegion && water.regions && (
          <p className="mt-0.5 text-xs text-stone-500">{water.regions.name}</p>
        )}
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <WaterTypeBadge type={water.water_type} />
          <PaidBadge isPaid={water.is_paid} />
        </div>
        {fish.length > 0 && (
          <p className="mt-1.5 truncate text-sm text-stone-600">
            <span className="text-stone-400">Клюёт: </span>
            {fish
              .slice(0, 4)
              .map((f) => f.name.replace(/\s*\(.*\)/, ""))
              .join(", ")}
            {fish.length > 4 && ` +${fish.length - 4}`}
          </p>
        )}
      </div>
    </Link>
  );
}
