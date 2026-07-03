import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  CalendarDays,
  Car,
  ChevronRight,
  Info,
  Phone,
  Wallet,
} from "lucide-react";
import {
  ManagedBadge,
  PaidBadge,
  VerifiedBadge,
  WaterTypeBadge,
} from "@/components/badges";
import { EmptyState } from "@/components/empty-state";
import { ListingCard } from "@/components/listing-card";
import { RouteButtons } from "@/components/route-buttons";
import { WaterCover } from "@/components/water-cover";
import { FACILITY_LABELS, SITE_URL } from "@/lib/constants";
import { getAllWaters, getListingsByWater, getWaterBySlug } from "@/lib/data";

export const revalidate = 1800;
export const dynamicParams = true;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const waters = await getAllWaters();
  return waters.map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const water = await getWaterBySlug(slug);
  if (!water) return { title: "Водоём не найден" };
  const fish = water.water_body_fish
    .map((f) => f.fish_species.name.replace(/\s*\(.*\)/, ""))
    .slice(0, 5)
    .join(", ");
  return {
    title: `${water.name} — рыбалка, ${water.regions?.name ?? "Казахстан"}`,
    description:
      `${water.name}: ${fish ? `клюёт ${fish.toLowerCase()}. ` : ""}` +
      water.description.slice(0, 150),
  };
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Info;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-stone-400">
        <Icon size={14} aria-hidden />
        {label}
      </p>
      <div className="mt-1.5 text-sm leading-relaxed text-stone-700">
        {children}
      </div>
    </div>
  );
}

export default async function WaterPage({ params }: Props) {
  const { slug } = await params;
  const water = await getWaterBySlug(slug);
  if (!water) notFound();

  const listings = await getListingsByWater(water.id);
  const fish = water.water_body_fish.map((f) => f.fish_species);
  const facilities = water.facilities
    .map((f) => FACILITY_LABELS[f])
    .filter(Boolean);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Place",
    name: water.name,
    description: water.description,
    url: `${SITE_URL}/water/${water.slug}`,
    ...(water.lat !== null && water.lng !== null
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: water.lat,
            longitude: water.lng,
          },
        }
      : {}),
  };

  return (
    <div className="flex flex-col gap-5">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav aria-label="Хлебные крошки" className="text-sm text-stone-500">
        <Link href="/" className="py-2 hover:text-teal-700">
          Каталог
        </Link>
        {water.regions && (
          <>
            {" / "}
            <Link
              href={`/regions/${water.regions.slug}`}
              className="py-2 hover:text-teal-700"
            >
              {water.regions.name}
            </Link>
          </>
        )}
      </nav>

      {/* Обложка и заголовок */}
      <div className="overflow-hidden rounded-3xl ring-1 ring-stone-200">
        <div className="relative h-40 sm:h-52">
          <WaterCover
            type={water.water_type}
            seed={water.slug}
            className="h-full w-full"
          />
        </div>
        <div className="bg-white p-4">
          <h1 className="text-2xl font-extrabold tracking-tight">
            {water.name}
          </h1>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <WaterTypeBadge type={water.water_type} />
            <PaidBadge isPaid={water.is_paid} />
            <ManagedBadge status={water.managed_status} />
            <VerifiedBadge verifiedAt={water.verified_at} />
          </div>
        </div>
      </div>

      {water.lat !== null && water.lng !== null && (
        <RouteButtons lat={water.lat} lng={water.lng} />
      )}

      <p className="whitespace-pre-line leading-relaxed text-stone-700">
        {water.description}
      </p>

      {/* Клюёт */}
      {fish.length > 0 && (
        <section aria-labelledby="fish-here">
          <h2 id="fish-here" className="mb-2 text-lg font-extrabold tracking-tight">
            Какая рыба клюёт
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {fish.map((f) => (
              <Link
                key={f.slug}
                href={`/fish/${f.slug}`}
                className="rounded-full bg-teal-50 px-3 py-1.5 text-sm font-semibold text-teal-800 ring-1 ring-teal-100 transition hover:bg-teal-100"
              >
                {f.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Факты */}
      <section className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {water.season_notes && (
          <Fact icon={CalendarDays} label="Сезон и клёв">
            {water.season_notes}
          </Fact>
        )}
        {(water.price_info || water.is_paid) && (
          <Fact icon={Wallet} label="Стоимость">
            {water.price_info ?? "Платный водоём — уточняйте цены на месте"}
          </Fact>
        )}
        {water.access_notes && (
          <Fact icon={Car} label="Как добраться">
            {water.access_notes}
          </Fact>
        )}
        {water.contacts && (
          <Fact icon={Phone} label="Контакты">
            {water.contacts}
          </Fact>
        )}
      </section>

      {facilities.length > 0 && (
        <section aria-labelledby="facilities-h">
          <h2 id="facilities-h" className="mb-2 text-lg font-extrabold tracking-tight">
            На месте
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {facilities.map((f) => (
              <span
                key={f}
                className="rounded-full bg-white px-3 py-1.5 text-sm font-medium text-stone-600 ring-1 ring-stone-200"
              >
                {f}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Правила водоёма */}
      {water.rules_text && (
        <section className="rounded-2xl bg-amber-50 p-4 ring-1 ring-amber-200">
          <h2 className="flex items-center gap-2 font-extrabold text-amber-900">
            <Info size={18} aria-hidden />
            Особые условия
          </h2>
          <p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-amber-900">
            {water.rules_text}
          </p>
          <Link
            href="/pages/rules"
            className="mt-2 inline-flex items-center py-1 text-sm font-bold text-amber-800 underline"
          >
            Общие правила рыбалки в РК
            <ChevronRight size={15} aria-hidden />
          </Link>
        </section>
      )}

      {/* Объявления по водоёму */}
      <section aria-labelledby="water-listings">
        <h2 id="water-listings" className="mb-2 text-lg font-extrabold tracking-tight">
          Услуги и объявления здесь
        </h2>
        {listings.length === 0 ? (
          <EmptyState emoji="📣" title="Объявлений по этому водоёму пока нет">
            Возите сюда рыбаков или продаёте путёвки?{" "}
            <Link href="/board/new" className="font-semibold text-teal-700 underline">
              Разместите объявление
            </Link>{" "}
            — это бесплатно.
          </EmptyState>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
