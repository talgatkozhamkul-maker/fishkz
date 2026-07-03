"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

/** Автор скрывает/возвращает своё объявление (RLS не даст активировать самому) */
export async function setMyListingStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!["hidden", "pending", "archived"].includes(status)) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .eq("author_id", user.id);
  if (error) throw new Error(`Не удалось обновить объявление: ${error.message}`);

  revalidatePath("/profile");
  revalidatePath("/board");
  revalidatePath("/");
}
