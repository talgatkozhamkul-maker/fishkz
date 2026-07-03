"use client";

import { useState } from "react";
import { ExternalLink, MessageCircle, Phone, Send } from "lucide-react";
import { displayPhone } from "@/lib/format";

// Контакты объявления. Телефон показывается по клику (решение открытого
// вопроса №5 SPEC в пользу «за кликом» — меньше автоматического скрейпинга
// номеров, вывод аудита безопасности).
export function ContactBlock({
  phone,
  whatsapp,
  telegram,
  kaspiLink,
}: {
  phone: string | null;
  whatsapp: string | null;
  telegram: string | null;
  kaspiLink: string | null;
}) {
  const [phoneShown, setPhoneShown] = useState(false);

  return (
    <div className="flex flex-col gap-2">
      {phone &&
        (phoneShown ? (
          <a
            href={`tel:${phone}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800"
          >
            <Phone size={18} aria-hidden />
            {displayPhone(phone)}
          </a>
        ) : (
          <button
            type="button"
            onClick={() => setPhoneShown(true)}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800"
          >
            <Phone size={18} aria-hidden />
            Показать телефон
          </button>
        ))}

      {whatsapp && (
        <a
          href={`https://wa.me/${whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-green-600 px-4 font-bold text-white transition hover:bg-green-700"
        >
          <MessageCircle size={18} aria-hidden />
          Написать в WhatsApp
        </a>
      )}

      {telegram && (
        <a
          href={`https://t.me/${telegram}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 font-bold text-white transition hover:bg-sky-600"
        >
          <Send size={18} aria-hidden />
          Telegram: @{telegram}
        </a>
      )}

      {kaspiLink && (
        <a
          href={kaspiLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 font-bold text-white transition hover:bg-red-700"
        >
          Оплатить через Kaspi
          <ExternalLink size={16} aria-hidden />
        </a>
      )}
      {kaspiLink && (
        <p className="text-center text-xs text-stone-400">
          Ссылка ведёт на {new URL(kaspiLink).hostname}
        </p>
      )}
    </div>
  );
}
