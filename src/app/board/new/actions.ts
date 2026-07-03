"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listingSchema } from "@/lib/validation";

export type CreateListingState = {
  error: string | null;
  fieldErrors: Record<string, string>;
};

export async function createListing(
  _prev: CreateListingState,
  formData: FormData,
): Promise<CreateListingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/board/new");

  const raw = {
    category: formData.get("category"),
    title: formData.get("title"),
    description: formData.get("description"),
    price: formData.get("price"),
    price_unit: formData.get("price_unit"),
    region_id: formData.get("region_id"),
    water_body_id: formData.get("water_body_id"),
    contact_phone: formData.get("contact_phone"),
    contact_whatsapp: formData.get("contact_whatsapp"),
    contact_telegram: formData.get("contact_telegram"),
    kaspi_link: formData.get("kaspi_link"),
  };

  const parsed = listingSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    let formError: string | null = null;
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string") fieldErrors[key] = issue.message;
      else formError = issue.message;
    }
    return { error: formError, fieldErrors };
  }

  const v = parsed.data;
  const { error } = await supabase.from("listings").insert({
    author_id: user.id,
    category: v.category,
    title: v.title,
    description: v.description,
    price: v.price ?? null,
    price_unit: v.price_unit || null,
    region_id: v.region_id || null,
    water_body_id: v.water_body_id || null,
    contact_phone: v.contact_phone ?? null,
    contact_whatsapp: v.contact_whatsapp ?? null,
    contact_telegram: v.contact_telegram ?? null,
    kaspi_link: v.kaspi_link ?? null,
    status: "pending",
  });

  if (error) {
    if (error.message.includes("daily_listing_limit")) {
      return {
        error: "Лимит: не больше 5 объявлений в сутки. Попробуйте завтра.",
        fieldErrors: {},
      };
    }
    return {
      error: "Не удалось сохранить объявление. Попробуйте ещё раз.",
      fieldErrors: {},
    };
  }

  redirect("/profile?created=1");
}
