import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { Check, EyeOff, ShieldCheck } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { LISTING_CATEGORIES } from "@/lib/constants";
import { displayPhone, formatDate, formatPrice } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Listing, Profile } from "@/lib/types";
import { moderateListing } from "./actions";

export const metadata: Metadata = {
  title: "Модерация",
  robots: { index: false },
};

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, phone, is_admin")
    .eq("id", user.id)
    .maybeSingle<Profile>();
  if (!profile?.is_admin) redirect("/profile");

  const { data, error } = await supabase
    .from("listings")
    .select(
      "id, author_id, category, title, description, price, price_unit, region_id, water_body_id, photos, contact_phone, contact_whatsapp, contact_telegram, kaspi_link, status, created_at",
    )
    .eq("status", "pending")
    .order("created_at", { ascending: true });
  if (error) throw new Error(`Не удалось загрузить очередь: ${error.message}`);
  const queue = (data ?? []) as Listing[];

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <ShieldCheck size={24} aria-hidden className="text-indigo-600" />
          Модерация
        </h1>
        <p className="mt-1 text-sm text-stone-500">
          Объявления в очереди: {queue.length}. Проверяйте контакты и ссылки
          перед публикацией.
        </p>
      </div>

      {queue.length === 0 ? (
        <EmptyState emoji="✅" title="Очередь пуста">
          Новые объявления появятся здесь после отправки пользователями.
        </EmptyState>
      ) : (
        <ul className="flex flex-col gap-3">
          {queue.map((l) => (
            <li key={l.id} className="rounded-2xl bg-white p-4 ring-1 ring-stone-200">
              <p className="text-xs font-bold uppercase tracking-wide text-stone-400">
                {LISTING_CATEGORIES[l.category].label} · {formatDate(l.created_at)}
              </p>
              <h2 className="mt-1 font-bold">{l.title}</h2>
              <p className="text-sm font-semibold text-teal-700">
                {formatPrice(l.price, l.price_unit)}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-stone-600">
                {l.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-stone-500">
                {l.contact_phone && <span>📞 {displayPhone(l.contact_phone)}</span>}
                {l.contact_whatsapp && <span>WhatsApp: {displayPhone(l.contact_whatsapp)}</span>}
                {l.contact_telegram && <span>TG: @{l.contact_telegram}</span>}
                {l.kaspi_link && (
                  <span className="break-all">Kaspi: {l.kaspi_link}</span>
                )}
              </div>
              <div className="mt-3 flex gap-2">
                <form action={moderateListing} className="flex-1">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="active" />
                  <button className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700">
                    <Check size={16} aria-hidden />
                    Одобрить
                  </button>
                </form>
                <form action={moderateListing} className="flex-1">
                  <input type="hidden" name="id" value={l.id} />
                  <input type="hidden" name="status" value="hidden" />
                  <button className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-stone-200 px-4 text-sm font-bold text-stone-700 transition hover:bg-stone-300">
                    <EyeOff size={16} aria-hidden />
                    Скрыть
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
