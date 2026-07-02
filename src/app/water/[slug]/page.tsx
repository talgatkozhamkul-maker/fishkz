import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WATER_TYPE_LABELS, type Region, type WaterBody } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function getWaterBody(slug: string) {
  const supabase = await createClient();
  const { data: water } = await supabase
    .from("water_bodies")
    .select(
      "id, region_id, name, slug, description, water_type, lat, lng, photos, is_paid, rules_text, contacts, status",
    )
    .eq("slug", slug)
    .maybeSingle<WaterBody>();
  return water;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const water = await getWaterBody(slug);
  return { title: water ? water.name : "Водоём не найден" };
}

export default async function WaterPage({ params }: Props) {
  const { slug } = await params;
  const water = await getWaterBody(slug);
  if (!water) notFound();

  const supabase = await createClient();
  const { data: region } = await supabase
    .from("regions")
    .select("id, name, slug, sort_order")
    .eq("id", water.region_id)
    .maybeSingle<Region>();

  const hasCoords = water.lat !== null && water.lng !== null;
  const mapUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${water.lat},${water.lng}`
    : null;

  return (
    <div className="flex flex-col gap-5">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-sky-700">
          Регионы
        </Link>
        {region && (
          <>
            {" / "}
            <Link
              href={`/regions/${region.slug}`}
              className="hover:text-sky-700"
            >
              {region.name}
            </Link>
          </>
        )}
        {" / "}
        <span className="text-zinc-700">{water.name}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{water.name}</h1>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-sky-50 px-2.5 py-1 font-medium text-sky-700">
            {WATER_TYPE_LABELS[water.water_type]}
          </span>
          <span
            className={
              water.is_paid
                ? "rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-700"
                : "rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700"
            }
          >
            {water.is_paid ? "Платный" : "Бесплатный"}
          </span>
        </div>
      </div>

      {water.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {water.photos.map((url, i) => (
            <div
              key={i}
              className="relative aspect-video overflow-hidden rounded-lg bg-zinc-100"
            >
              <Image
                src={url}
                alt={`${water.name} — фото ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 320px"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-3 font-medium text-white transition hover:bg-sky-700 sm:w-auto"
        >
          📍 Маршрут
        </a>
      )}

      {water.description && (
        <section>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Описание
          </h2>
          <p className="whitespace-pre-line text-zinc-700">
            {water.description}
          </p>
        </section>
      )}

      {water.rules_text && (
        <section>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Правила водоёма
          </h2>
          <p className="whitespace-pre-line text-zinc-700">
            {water.rules_text}
          </p>
        </section>
      )}

      {water.contacts && (
        <section>
          <h2 className="mb-1 text-sm font-medium uppercase tracking-wide text-zinc-500">
            Контакты
          </h2>
          <p className="whitespace-pre-line text-zinc-700">{water.contacts}</p>
        </section>
      )}
    </div>
  );
}
