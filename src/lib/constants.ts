import type { ListingCategory, ManagedStatus, WaterType } from "@/lib/types";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://fishkz.vercel.app";

export const SITE_NAME = "FishKZ";
export const SITE_TAGLINE = "Справочник рыбака Казахстана";
export const SITE_DESCRIPTION =
  "Куда поехать на рыбалку в Казахстане: каталог водоёмов с видами рыб, правила и запреты, платные пруды, гиды и туры.";

export const WATER_TYPE_LABELS: Record<WaterType, string> = {
  lake: "Озеро",
  river: "Река",
  pond: "Пруд",
  reservoir: "Водохранилище",
};

export const MANAGED_STATUS_LABELS: Record<
  ManagedStatus,
  { label: string; hint: string }
> = {
  reserved: {
    label: "Свободный лов",
    hint: "Резервный фонд: любительская рыбалка в рамках общих правил",
  },
  assigned: {
    label: "Закреплённый",
    hint: "Закреплён за хозяйством: нужна путёвка или разрешение владельца",
  },
};

export const LISTING_CATEGORIES: Record<
  ListingCategory,
  { label: string; plural: string }
> = {
  putevka: { label: "Путёвка", plural: "Путёвки" },
  guide: { label: "Гид", plural: "Гиды" },
  tour: { label: "Тур", plural: "Туры" },
  base: { label: "База отдыха", plural: "Базы" },
  companion: { label: "Попутчики", plural: "Попутчики" },
  service: { label: "Услуга", plural: "Услуги" },
};

/** Тэги инфраструктуры водоёма (facilities) — заполняются из фикс. набора */
export const FACILITY_LABELS: Record<string, string> = {
  car_access: "Подъезд на авто",
  boat: "Лодки / прокат",
  base: "Базы отдыха рядом",
  winter: "Зимняя рыбалка",
  camping: "Можно с палаткой",
  shore: "Ловля с берега",
  pier: "Мостки / причал",
  cafe: "Кафе / магазин рядом",
};

/** Сколько дней данные считаются «свежими» для маркера проверки */
export const VERIFIED_FRESH_DAYS = 90;
