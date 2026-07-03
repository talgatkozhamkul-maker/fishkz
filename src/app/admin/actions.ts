"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .maybeSingle<{ is_admin: boolean }>();
  if (!profile?.is_admin) redirect("/profile");
  return supabase;
}

/** Модерация: одобрить или скрыть объявление. RLS-политика admin — второй рубеж. */
export async function moderateListing(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["active", "hidden"].includes(status)) return;

  const supabase = await requireAdmin();
  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(`Не удалось обновить статус: ${error.message}`);

  // Обновляем закэшированные страницы сразу (ISR + on-demand revalidate)
  revalidatePath("/");
  revalidatePath("/board");
  revalidatePath("/admin");
}
