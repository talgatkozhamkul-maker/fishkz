"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { emailSchema, otpSchema } from "@/lib/validation";

export type LoginState = {
  step: "email" | "code";
  email: string;
  error: string | null;
};

/** Шаг 1: отправить одноразовый код на e-mail */
export async function requestCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const parsed = emailSchema.safeParse(formData.get("email"));
  if (!parsed.success) {
    return { step: "email", email: "", error: "Введите корректный e-mail" };
  }
  const email = parsed.data.toLowerCase();

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) {
    const msg = error.message.includes("rate")
      ? "Слишком много запросов — подождите минуту и попробуйте снова"
      : "Не удалось отправить письмо. Попробуйте ещё раз";
    return { step: "email", email, error: msg };
  }
  return { step: "code", email, error: null };
}

/** Шаг 2: проверить код из письма */
export async function verifyCode(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").toLowerCase();
  const parsed = otpSchema.safeParse(formData.get("token"));
  if (!parsed.success) {
    return { step: "code", email, error: "Код — 6 цифр из письма" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: parsed.data,
    type: "email",
  });
  if (error) {
    return {
      step: "code",
      email,
      error: "Код не подошёл или устарел. Запросите новый",
    };
  }

  const next = String(formData.get("next") ?? "/profile");
  redirect(next.startsWith("/") ? next : "/profile");
}
