import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EmptyState } from "@/components/empty-state";
import { WaterCard } from "@/components/water-card";
import { getRegionBySlug, getRegions, getWatersByRegion } from "@/lib/data";
import { pluralRu } from "@/lib/format";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const regions = await getRegions();
  return regions.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const region = await getRegionBySlug(slug);
  if (!region) return { title: "Регион не найден" };
  return {
    title: `Рыбалка — ${region.name}`,
    description: `Водоёмы для рыбалки: ${region.name}. Виды рыб, платные и бесплатные места, как добраться.`,
  };
}

export default async function RegionPage({ params }: Props) {
  const { slug } = await params;
  const region = await getRegionBySlug(slug);
  if (!region) notFound();

  const waters = await getWatersByRegion(region.id);

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Хлебные крошки" className="text-sm text-stone-500">
        <Link href="/" className="py-2 hover:text-teal-700">
          Каталог
        </Link>{" "}
        / <span className="text-stone-700">{region.name}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{region.name}</h1>
        <p className="mt-1 text-sm text-stone-500">
          {waters.length}{" "}
          {pluralRu(waters.length, "водоём", "водоёма", "водоёмов")} в каталоге
        </p>
      </div>

      {waters.length === 0 ? (
        <EmptyState title="Водоёмы этого региона ещё не добавлены">
          Знаете хорошее место? Напишите нам через раздел «О сервисе».
        </EmptyState>
      ) : (
        <div className="flex flex-col gap-2">
          {waters.map((w) => (
            <WaterCard key={w.id} water={w} />
          ))}
        </div>
      )}
    </div>
  );
}
