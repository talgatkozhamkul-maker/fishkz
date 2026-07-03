import Link from "next/link";
import { Compass, MapPin, Ship, Tent, Ticket, Users, Wrench } from "lucide-react";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { formatPrice } from "@/lib/format";
import type { ListingCategory, ListingWithRelations } from "@/lib/types";

const CATEGORY_ICONS: Record<ListingCategory, typeof Ticket> = {
  putevka: Ticket,
  guide: Compass,
  tour: Tent,
  base: Ship,
  companion: Users,
  service: Wrench,
};

const CATEGORY_TILES: Record<ListingCategory, string> = {
  putevka: "bg-amber-100 text-amber-700",
  guide: "bg-teal-100 text-teal-700",
  tour: "bg-sky-100 text-sky-700",
  base: "bg-indigo-100 text-indigo-700",
  companion: "bg-rose-100 text-rose-700",
  service: "bg-stone-200 text-stone-700",
};

export function ListingCard({ listing }: { listing: ListingWithRelations }) {
  const Icon = CATEGORY_ICONS[listing.category];
  const place = listing.water_bodies?.name ?? listing.regions?.name;
  return (
    <Link
      href={`/board/${listing.id}`}
      className="group flex gap-3 rounded-2xl bg-white p-3 ring-1 ring-stone-200 transition hover:ring-teal-400 focus-visible:outline-2 focus-visible:outline-teal-600"
    >
      <div
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${CATEGORY_TILES[listing.category]}`}
      >
        <Icon size={26} aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
          {LISTING_CATEGORIES[listing.category].label}
        </p>
        <h3 className="truncate font-bold leading-snug text-stone-900 group-hover:text-teal-800">
          {listing.title}
        </h3>
        <p className="mt-1 text-sm font-bold text-teal-700">
          {formatPrice(listing.price, listing.price_unit)}
        </p>
        {place && (
          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-stone-500">
            <MapPin size={12} aria-hidden className="shrink-0" />
            {place}
          </p>
        )}
      </div>
    </Link>
  );
}
