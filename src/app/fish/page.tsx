import Link from "next/link";
import type { Metadata } from "next";
import { getFishSpecies } from "@/lib/data";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Виды рыб Казахстана",
  description:
    "Справочник рыболова: какие рыбы водятся в Казахстане, когда клюют и на что ловить. Судак, сазан, щука, сом и другие.",
};

export default async function FishIndexPage() {
  const species = await getFishSpecies();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Виды рыб</h1>
        <p className="mt-1 text-sm text-stone-500">
          Выберите рыбу — покажем, где она клюёт
        </p>
      </div>

      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {species.map((s) => (
          <li key={s.id}>
            <Link
              href={`/fish/${s.slug}`}
              className="flex h-full flex-col rounded-2xl bg-white p-4 ring-1 ring-stone-200 transition hover:ring-teal-400 focus-visible:outline-2 focus-visible:outline-teal-600"
            >
              <span className="font-bold text-stone-900">{s.name}</span>
              {s.latin && (
                <span className="text-xs italic text-stone-400">{s.latin}</span>
              )}
              <span className="mt-1.5 line-clamp-2 text-sm text-stone-600">
                {s.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
