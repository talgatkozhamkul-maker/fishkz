import { BadgeCheck, Ticket } from "lucide-react";
import {
  MANAGED_STATUS_LABELS,
  VERIFIED_FRESH_DAYS,
  WATER_TYPE_LABELS,
} from "@/lib/constants";
import { daysSince, pluralRu } from "@/lib/format";
import type { ManagedStatus, WaterType } from "@/lib/types";

export function WaterTypeBadge({ type }: { type: WaterType }) {
  return (
    <span className="inline-flex items-center rounded-full bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
      {WATER_TYPE_LABELS[type]}
    </span>
  );
}

export function PaidBadge({ isPaid }: { isPaid: boolean }) {
  return isPaid ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
      <Ticket size={12} aria-hidden /> Платный
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      Бесплатный
    </span>
  );
}

export function ManagedBadge({ status }: { status: ManagedStatus }) {
  const { label, hint } = MANAGED_STATUS_LABELS[status];
  return (
    <span
      title={hint}
      className={
        status === "assigned"
          ? "inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-800"
          : "inline-flex items-center rounded-full bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-800"
      }
    >
      {label}
    </span>
  );
}

/** «Данные проверены N дней назад» — маркер свежести из исследования */
export function VerifiedBadge({ verifiedAt }: { verifiedAt: string | null }) {
  if (!verifiedAt) return null;
  const days = daysSince(verifiedAt);
  if (days > VERIFIED_FRESH_DAYS) return null;
  const text =
    days <= 0
      ? "Данные проверены сегодня"
      : `Данные проверены ${days} ${pluralRu(days, "день", "дня", "дней")} назад`;
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
      <BadgeCheck size={13} aria-hidden />
      {text}
    </span>
  );
}
