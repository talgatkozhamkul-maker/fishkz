import { z } from "zod";
import { normalizePhone } from "@/lib/format";

// Zod-схемы форм. Используются и на клиенте, и в server actions (правило
// проекта: валидация с двух сторон). Рекомендации аудита безопасности:
// kaspi_link — только домены Kaspi, telegram — только username, телефоны
// нормализуются к +7XXXXXXXXXX.

const phoneField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const normalized = normalizePhone(v);
    if (!normalized) {
      ctx.addIssue({
        code: "custom",
        message: "Телефон в формате +7 701 123 45 67",
      });
      return z.NEVER;
    }
    return normalized;
  })
  .nullable()
  .optional();

const telegramField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    const username = v.replace(/^@/, "").replace(/^https?:\/\/t\.me\//, "");
    if (!/^[a-zA-Z0-9_]{5,32}$/.test(username)) {
      ctx.addIssue({
        code: "custom",
        message: "Telegram: username из 5–32 латинских букв/цифр",
      });
      return z.NEVER;
    }
    return username;
  })
  .nullable()
  .optional();

const kaspiField = z
  .string()
  .trim()
  .transform((v, ctx) => {
    if (v === "") return null;
    let url: URL;
    try {
      url = new URL(v);
    } catch {
      ctx.addIssue({ code: "custom", message: "Ссылка Kaspi некорректна" });
      return z.NEVER;
    }
    const allowed = ["pay.kaspi.kz", "kaspi.kz", "www.kaspi.kz"];
    if (url.protocol !== "https:" || !allowed.includes(url.hostname)) {
      ctx.addIssue({
        code: "custom",
        message: "Принимаются только ссылки на kaspi.kz",
      });
      return z.NEVER;
    }
    return url.toString();
  })
  .nullable()
  .optional();

export const listingSchema = z
  .object({
    category: z.enum([
      "putevka",
      "guide",
      "tour",
      "base",
      "companion",
      "service",
    ]),
    title: z
      .string()
      .trim()
      .min(5, "Заголовок — минимум 5 символов")
      .max(80, "Заголовок — максимум 80 символов"),
    description: z
      .string()
      .trim()
      .min(20, "Опишите подробнее — минимум 20 символов")
      .max(2000, "Описание — максимум 2000 символов"),
    price: z.coerce
      .number()
      .int("Цена — целое число в тенге")
      .min(0)
      .max(100_000_000)
      .nullable()
      .optional()
      .or(z.literal("").transform(() => null)),
    price_unit: z.string().trim().max(30).optional().default(""),
    region_id: z.uuid().nullable().optional().or(z.literal("").transform(() => null)),
    water_body_id: z.uuid().nullable().optional().or(z.literal("").transform(() => null)),
    contact_phone: phoneField,
    contact_whatsapp: phoneField,
    contact_telegram: telegramField,
    kaspi_link: kaspiField,
  })
  .refine(
    (v) => v.contact_phone || v.contact_whatsapp || v.contact_telegram,
    { message: "Укажите хотя бы один контакт: телефон, WhatsApp или Telegram" },
  );

export type ListingInput = z.infer<typeof listingSchema>;

export const emailSchema = z.email("Введите корректный e-mail");

export const otpSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Код — 6 цифр из письма");
