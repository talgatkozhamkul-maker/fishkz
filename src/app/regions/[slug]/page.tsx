import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { WATER_TYPE_LABELS, type Region, type WaterBody } from "@/lib/types";

type Props = { params: Promise<{ slug: string }> };

async function getRegion(slug: string) {
  const supabase = await createClient();
  const { data: region } = await supabase
    .from("regions")
    .select("id, name, slug, sort_order")
    .eq("slug", slug)
    .maybeSingle<Region>();
  return region;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegion(slug);
  return { title: region ? region.name : "Регион не найден" };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const region = await getRegion(slug);
  if (!region) notFound();

  const { data: waterBodies } = await supabase
    .from("water_bodies")
    .select(
      "id, region_id, name, slug, description, water_type, lat, lng, photos, is_paid, rules_text, contacts, status",
    )
    .eq("region_id", region.id)
    .order("name", { ascending: true })
    .returns<WaterBody[]>();

  return (
    <div className="flex flex-col gap-6">
      <nav className="text-sm text-zinc-500">
        <Link href="/" className="hover:text-sky-700">
          Регионы
        </Link>{" "}
        / <span className="text-zinc-700">{region.name}</span>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight">{region.name}</h1>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Водоёмы
        </h2>

        {(!waterBodies || waterBodies.length === 0) && (
          <p className="rounded-lg bg-white p-4 text-sm text-zinc-500 ring-1 ring-zinc-200">
            В этом регионе пока нет водоёмов.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {waterBodies?.map((water) => (
            <li key={water.id}>
              <Link
                href={`/water/${water.slug}`}
                className="block rounded-lg bg-white px-4 py-3 ring-1 ring-zinc-200 transition hover:ring-sky-300"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{water.name}</span>
                  <span className="text-xs text-zinc-500">
                    {WATER_TYPE_LABELS[water.water_type]}
                  </span>
                </div>
                {water.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                    {water.description}
                  </p>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
