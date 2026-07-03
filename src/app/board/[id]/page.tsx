import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { MapPin, ShieldAlert } from "lucide-react";
import { ContactBlock } from "@/components/contact-block";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { createStaticClient } from "@/lib/supabase/static";
import type { ListingWithRelations } from "@/lib/types";

type Props = { params: Promise<{ id: string }> };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getListing(id: string): Promise<ListingWithRelations | null> {
  if (!UUID_RE.test(id)) return null;
  const supabase = createStaticClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, author_id, category, title, description, price, price_unit, region_id, water_body_id, photos, contact_phone, contact_whatsapp, contact_telegram, kaspi_link, status, created_at, regions(name, slug), water_bodies(name, slug)",
    )
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw new Error(`Ошибка загрузки объявления: ${error.message}`);
  return data as unknown as ListingWithRelations | null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) return { title: "Объявление не найдено" };
  return {
    title: listing.title,
    description: listing.description.slice(0, 160),
  };
}

export default async function ListingPage({ params }: Props) {
  const { id } = await params;
  const listing = await getListing(id);
  if (!listing) notFound();

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Хлебные крошки" className="text-sm text-stone-500">
        <Link href="/board" className="py-2 hover:text-teal-700">
          Объявления
        </Link>{" "}
        /{" "}
        <span className="text-stone-700">
          {LISTING_CATEGORIES[listing.category].label}
        </span>
      </nav>

      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
          {LISTING_CATEGORIES[listing.category].label} ·{" "}
          {formatDate(listing.created_at)}
        </p>
        <h1 className="mt-1 text-2xl font-extrabold leading-tight tracking-tight">
          {listing.title}
        </h1>
        <p className="mt-2 text-2xl font-extrabold text-teal-700">
          {formatPrice(listing.price, listing.price_unit)}
        </p>
      </div>

      {(listing.water_bodies || listing.regions) && (
        <div className="flex flex-wrap gap-1.5">
          {listing.water_bodies && (
            <Link
              href={`/water/${listing.water_bodies.slug}`}
              className="inline-flex items-center gap-1 rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-teal-100 hover:bg-teal-100"
            >
              <MapPin size={14} aria-hidden />
              {listing.water_bodies.name}
            </Link>
          )}
          {listing.regions && (
            <Link
              href={`/regions/${listing.regions.slug}`}
              className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-600 ring-1 ring-stone-200 hover:ring-teal-400"
            >
              {listing.regions.name}
            </Link>
          )}
        </div>
      )}

      <p className="whitespace-pre-line leading-relaxed text-stone-700">
        {listing.description}
      </p>

      <section className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
        <h2 className="mb-3 font-extrabold">Связаться с автором</h2>
        <ContactBlock
          phone={listing.contact_phone}
          whatsapp={listing.contact_whatsapp}
          telegram={listing.contact_telegram}
          kaspiLink={listing.kaspi_link}
        />
      </section>

      <p className="flex items-start gap-2 text-xs leading-relaxed text-stone-400">
        <ShieldAlert size={16} aria-hidden className="mt-0.5 shrink-0" />
        FishKZ не участвует в сделках и не проверяет исполнителей. Договаривайтесь
        напрямую, не вносите крупную предоплату незнакомым людям.
      </p>
    </div>
  );
}
