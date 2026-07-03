import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { LogOut, Plus, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Listing, ListingStatus, Profile } from "@/lib/types";
import { setMyListingStatus, signOut } from "./actions";

export const metadata: Metadata = {
  title: "Профиль",
  robots: { index: false },
};

const STATUS_LABELS: Record<ListingStatus, { label: string; cls: string }> = {
  pending: { label: "На модерации", cls: "bg-amber-50 text-amber-800" },
  active: { label: "Опубликовано", cls: "bg-emerald-50 text-emerald-800" },
  hidden: { label: "Скрыто", cls: "bg-stone-100 text-stone-600" },
  archived: { label: "В архиве", cls: "bg-stone-100 text-stone-500" },
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: listings, error }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, display_name, phone, is_admin")
      .eq("id", user.id)
      .maybeSingle<Profile>(),
    supabase
      .from("listings")
      .select(
        "id, author_id, category, title, description, price, price_unit, region_id, water_body_id, photos, contact_phone, contact_whatsapp, contact_telegram, kaspi_link, status, created_at",
      )
      .eq("author_id", user.id)
      .neq("status", "archived")
      .order("created_at", { ascending: false }),
  ]);
  if (error) throw new Error(`Не удалось загрузить объявления: ${error.message}`);
  const myListings = (listings ?? []) as Listing[];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {profile?.display_name || "Профиль"}
          </h1>
          <p className="mt-0.5 text-sm text-stone-500">{user.email}</p>
        </div>
        <form action={signOut}>
          <button
            type="submit"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-white px-3 text-sm font-semibold text-stone-600 ring-1 ring-stone-200 transition hover:text-red-700 hover:ring-red-300"
          >
            <LogOut size={16} aria-hidden />
            Выйти
          </button>
        </form>
      </div>

      {profile?.is_admin && (
        <Link
          href="/admin"
          className="flex items-center gap-2 rounded-2xl bg-indigo-50 p-4 font-bold text-indigo-800 ring-1 ring-indigo-200 transition hover:bg-indigo-100"
        >
          <ShieldCheck size={20} aria-hidden />
          Панель модерации
        </Link>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight">Мои объявления</h2>
        <Link
          href="/board/new"
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-teal-700 px-4 text-sm font-bold text-white transition hover:bg-teal-800"
        >
          <Plus size={16} aria-hidden />
          Новое
        </Link>
      </div>

      {myListings.length === 0 ? (
        <EmptyState emoji="📝" title="У вас пока нет объявлений">
          Разместите путёвку, тур или объявление о поиске попутчиков.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-2">
          {myListings.map((l) => {
            const st = STATUS_LABELS[l.status];
            return (
              <li
                key={l.id}
                className="rounded-2xl bg-white p-4 ring-1 ring-stone-200"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                      {LISTING_CATEGORIES[l.category].label} ·{" "}
                      {formatDate(l.created_at)}
                    </p>
                    <p className="mt-0.5 truncate font-bold">{l.title}</p>
                    <p className="text-sm font-semibold text-teal-700">
                      {formatPrice(l.price, l.price_unit)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${st.cls}`}
                  >
                    {st.label}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {l.status === "active" && (
                    <>
                      <Link
                        href={`/board/${l.id}`}
                        className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200"
                      >
                        Открыть
                      </Link>
                      <form action={setMyListingStatus}>
                        <input type="hidden" name="id" value={l.id} />
                        <input type="hidden" name="status" value="hidden" />
                        <button className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200">
                          Скрыть
                        </button>
                      </form>
                    </>
                  )}
                  {l.status === "hidden" && (
                    <form action={setMyListingStatus}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="status" value="pending" />
                      <button className="rounded-lg bg-stone-100 px-3 py-2 text-xs font-bold text-stone-700 hover:bg-stone-200">
                        Вернуть на модерацию
                      </button>
                    </form>
                  )}
                  {l.status === "pending" && (
                    <p className="text-xs text-stone-400">
                      Объявление появится на доске после проверки модератором.
                    </p>
                  )}
                  <form action={setMyListingStatus} className="ml-auto">
                    <input type="hidden" name="id" value={l.id} />
                    <input type="hidden" name="status" value="archived" />
                    <button className="rounded-lg px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50">
                      Удалить
                    </button>
                  </form>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
