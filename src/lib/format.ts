/** Форматирование значений для UI. Все функции чистые. */

export function formatPrice(price: number | null, unit?: string | null): string {
  if (price === null || price === undefined) return "Цена по запросу";
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return unit ? `${formatted} ₸ ${unit}` : `${formatted} ₸`;
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** «данные проверены N дней назад» для маркера свежести */
export function daysSince(isoDate: string): number {
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

/** Нормализует телефон к +7XXXXXXXXXX; null если не похоже на номер КЗ/РФ */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return `+7${digits.slice(1)}`;
  }
  if (digits.length === 10 && digits.startsWith("7")) return `+7${digits}`;
  return null;
}

export function displayPhone(phone: string): string {
  // +77011234567 → +7 701 123-45-67
  const m = /^\+7(\d{3})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return m ? `+7 ${m[1]} ${m[2]}-${m[3]}-${m[4]}` : phone;
}

export function pluralRu(
  n: number,
  one: string,
  few: string,
  many: string,
): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}
