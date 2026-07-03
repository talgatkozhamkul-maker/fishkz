import type { Metadata } from "next";
import { getAllWaters, getRegions } from "@/lib/data";
import { ListingForm } from "./listing-form";

export const metadata: Metadata = {
  title: "Новое объявление",
  robots: { index: false },
};

// Доступ закрыт proxy.ts (только вошедшие); server action дополнительно
// проверяет пользователя, а RLS в базе — последний рубеж.
export default async function NewListingPage() {
  const [regions, waters] = await Promise.all([getRegions(), getAllWaters()]);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">
          Новое объявление
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Путёвки, туры, услуги гида, попутчики — бесплатно
        </p>
      </div>
      <ListingForm
        regions={regions}
        waters={waters.map((w) => ({
          id: w.id,
          name: w.name,
          region_id: w.region_id,
        }))}
      />
    </div>
  );
}
