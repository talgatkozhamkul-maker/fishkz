"use client";

import { useActionState, useMemo, useState } from "react";
import { LISTING_CATEGORIES } from "@/lib/constants";
import type { ListingCategory, Region } from "@/lib/types";
import { createListing, type CreateListingState } from "./actions";

type WaterOption = { id: string; name: string; region_id: string };

const initial: CreateListingState = { error: null, fieldErrors: {} };

function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      {children}
      {hint && !error && <span className="text-xs text-stone-400">{hint}</span>}
      {error && (
        <span role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </span>
      )}
    </label>
  );
}

const inputCls =
  "h-12 w-full rounded-xl border-0 bg-white px-3.5 text-base ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-teal-500 focus:outline-none";

export function ListingForm({
  regions,
  waters,
}: {
  regions: Region[];
  waters: WaterOption[];
}) {
  const [state, dispatch, pending] = useActionState(createListing, initial);
  const [regionId, setRegionId] = useState("");

  const regionWaters = useMemo(
    () => (regionId ? waters.filter((w) => w.region_id === regionId) : waters),
    [regionId, waters],
  );

  return (
    <form action={dispatch} className="flex flex-col gap-4">
      <Field label="Категория" error={state.fieldErrors.category}>
        <select name="category" required className={inputCls} defaultValue="putevka">
          {(Object.keys(LISTING_CATEGORIES) as ListingCategory[]).map((c) => (
            <option key={c} value={c}>
              {LISTING_CATEGORIES[c].label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Заголовок" error={state.fieldErrors.title}>
        <input
          name="title"
          required
          minLength={5}
          maxLength={80}
          placeholder="Например: Путёвка на карпятник — Сорбулак"
          className={inputCls}
        />
      </Field>

      <Field
        label="Описание"
        error={state.fieldErrors.description}
        hint="Что входит, условия, время работы — чем подробнее, тем больше откликов"
      >
        <textarea
          name="description"
          required
          minLength={20}
          maxLength={2000}
          rows={5}
          placeholder="Опишите услугу…"
          className="w-full rounded-xl border-0 bg-white px-3.5 py-3 text-base ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
        />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Цена, ₸" error={state.fieldErrors.price} hint="Пусто — «по запросу»">
          <input
            name="price"
            type="number"
            min={0}
            step={1}
            inputMode="numeric"
            placeholder="2500"
            className={inputCls}
          />
        </Field>
        <Field label="За что" error={state.fieldErrors.price_unit}>
          <input
            name="price_unit"
            maxLength={30}
            placeholder="за день"
            className={inputCls}
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Регион" error={state.fieldErrors.region_id}>
          <select
            name="region_id"
            className={inputCls}
            value={regionId}
            onChange={(e) => setRegionId(e.target.value)}
          >
            <option value="">Не указывать</option>
            {regions.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Водоём" error={state.fieldErrors.water_body_id}>
          <select name="water_body_id" className={inputCls} defaultValue="">
            <option value="">Не указывать</option>
            {regionWaters.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <fieldset className="rounded-2xl bg-stone-100/70 p-4">
        <legend className="px-1 text-sm font-bold text-stone-700">
          Контакты — минимум один
        </legend>
        <div className="flex flex-col gap-3">
          <Field label="Телефон" error={state.fieldErrors.contact_phone}>
            <input
              name="contact_phone"
              type="tel"
              placeholder="+7 701 123 45 67"
              className={inputCls}
            />
          </Field>
          <Field label="WhatsApp" error={state.fieldErrors.contact_whatsapp}>
            <input
              name="contact_whatsapp"
              type="tel"
              placeholder="+7 701 123 45 67"
              className={inputCls}
            />
          </Field>
          <Field label="Telegram" error={state.fieldErrors.contact_telegram}>
            <input
              name="contact_telegram"
              placeholder="@username"
              className={inputCls}
            />
          </Field>
          <Field
            label="Ссылка Kaspi (необязательно)"
            error={state.fieldErrors.kaspi_link}
            hint="Только ссылки pay.kaspi.kz — покупатель платит вам напрямую"
          >
            <input
              name="kaspi_link"
              type="url"
              placeholder="https://pay.kaspi.kz/pay/…"
              className={inputCls}
            />
          </Field>
        </div>
      </fieldset>

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
      >
        {pending ? "Сохраняем…" : "Отправить на модерацию"}
      </button>
      <p className="text-center text-xs leading-relaxed text-stone-400">
        Объявление появится на доске после проверки модератором — обычно в
        течение дня.
      </p>
    </form>
  );
}
