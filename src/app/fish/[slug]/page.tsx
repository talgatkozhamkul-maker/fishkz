import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { CalendarDays, Target } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { WaterCard } from "@/components/water-card";
import { getFishBySlug, getFishSpecies, getWatersByFish } from "@/lib/data";
import { pluralRu } from "@/lib/format";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const species = await getFishSpecies();
  return species.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const fish = await getFishBySlug(slug);
  if (!fish) return { title: "Вид не найден" };
  return {
    title: `${fish.name} — где ловить в Казахстане`,
    description: fish.description.slice(0, 160),
  };
}

export default async function FishPage({ params }: Props) {
  const { slug } = await params;
  const fish = await getFishBySlug(slug);
  if (!fish) notFound();

  const waters = await getWatersByFish(fish.id);
  const isProtected = fish.description.includes("⚠");

  return (
    <div className="flex flex-col gap-5">
      <nav aria-label="Хлебные крошки" className="text-sm text-stone-500">
        <Link href="/fish" className="py-2 hover:text-teal-700">
          Виды рыб
        </Link>{" "}
        / <span className="text-stone-700">{fish.name}</span>
      </nav>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">{fish.name}</h1>
        {fish.latin && (
          <p className="mt-0.5 text-sm italic text-stone-400">{fish.latin}</p>
        )}
      </div>

      <p className="whitespace-pre-line leading-relaxed text-stone-700">
        {fish.description}
      </p>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {fish.season && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">
              <CalendarDays size={14} aria-hidden />
              Когда клюёт
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
              {fish.season}
            </p>
          </div>
        )}
        {fish.methods && (
          <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">
              <Target size={14} aria-hidden />
              Как ловить
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-stone-700">
              {fish.methods}
            </p>
          </div>
        )}
      </div>

      <section aria-labelledby="where-h">
        <h2 id="where-h" className="mb-2 text-lg font-extrabold tracking-tight">
          Где ловить
          {waters.length > 0 && (
            <span className="ml-2 text-sm font-semibold text-stone-400">
              {waters.length}{" "}
              {pluralRu(waters.length, "водоём", "водоёма", "водоёмов")}
            </span>
          )}
        </h2>
        {waters.length === 0 ? (
          <EmptyState
            emoji={isProtected ? "🚫" : "🗺️"}
            title={
              isProtected
                ? "Целенаправленный лов этого вида запрещён"
                : "Водоёмы с этим видом ещё не добавлены"
            }
          >
            {isProtected
              ? "Вид охраняется законом РК. Поймали случайно — аккуратно отпустите."
              : "Каталог пополняется."}
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {waters.map((w) => (
              <WaterCard key={w.id} water={w} showRegion />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
