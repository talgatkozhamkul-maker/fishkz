import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import type { Region } from "@/lib/types";

export default async function Home() {
  const supabase = await createClient();
  const { data: regions, error } = await supabase
    .from("regions")
    .select("id, name, slug, sort_order")
    .order("sort_order", { ascending: true })
    .returns<Region[]>();

  return (
    <div className="flex flex-col gap-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">
          Рыбалка в Казахстане
        </h1>
        <p className="mt-2 text-zinc-600">
          Выберите регион, чтобы посмотреть водоёмы, описания и правила.
        </p>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-zinc-500">
          Регионы
        </h2>

        {error && (
          <p className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Не удалось загрузить регионы. Попробуйте обновить страницу.
          </p>
        )}

        {!error && regions && regions.length === 0 && (
          <p className="rounded-lg bg-white p-4 text-sm text-zinc-500 ring-1 ring-zinc-200">
            Регионы пока не добавлены.
          </p>
        )}

        <ul className="flex flex-col gap-2">
          {regions?.map((region) => (
            <li key={region.id}>
              <Link
                href={`/regions/${region.slug}`}
                className="flex items-center justify-between rounded-lg bg-white px-4 py-3 ring-1 ring-zinc-200 transition hover:ring-sky-300"
              >
                <span className="font-medium">{region.name}</span>
                <span aria-hidden className="text-zinc-400">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
