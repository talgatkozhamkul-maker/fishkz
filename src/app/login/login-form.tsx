"use client";

import { useActionState } from "react";
import { KeyRound, Mail } from "lucide-react";
import { requestCode, verifyCode, type LoginState } from "./actions";

const initial: LoginState = { step: "email", email: "", error: null };

export function LoginForm({ next }: { next: string }) {
  const [state, dispatch, pending] = useActionState(
    async (prev: LoginState, formData: FormData) =>
      prev.step === "email"
        ? requestCode(prev, formData)
        : verifyCode(prev, formData),
    initial,
  );

  return (
    <form action={dispatch} className="flex flex-col gap-3">
      <input type="hidden" name="next" value={next} />

      {state.step === "email" ? (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-stone-700">E-mail</span>
          <div className="relative">
            <Mail
              size={17}
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
            />
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              className="h-12 w-full rounded-xl border-0 bg-white pl-10 pr-3 text-base ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-teal-500 focus:outline-none"
            />
          </div>
        </label>
      ) : (
        <>
          <input type="hidden" name="email" value={state.email} />
          <p className="rounded-xl bg-teal-50 p-3 text-sm leading-relaxed text-teal-900">
            Отправили 6-значный код на <b>{state.email}</b>. Если письма нет —
            проверьте «Спам».
          </p>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-stone-700">
              Код из письма
            </span>
            <div className="relative">
              <KeyRound
                size={17}
                aria-hidden
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <input
                type="text"
                name="token"
                required
                autoFocus
                inputMode="numeric"
                pattern="\d{6}"
                maxLength={6}
                autoComplete="one-time-code"
                placeholder="000000"
                className="h-12 w-full rounded-xl border-0 bg-white pl-10 pr-3 text-lg font-bold tracking-[0.3em] ring-1 ring-stone-200 placeholder:font-normal placeholder:tracking-normal placeholder:text-stone-300 focus:ring-2 focus:ring-teal-500 focus:outline-none"
              />
            </div>
          </label>
        </>
      )}

      {state.error && (
        <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-700">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-1 inline-flex min-h-12 items-center justify-center rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
      >
        {pending
          ? "Секунду…"
          : state.step === "email"
            ? "Получить код"
            : "Войти"}
      </button>

      {state.step === "code" && (
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="py-2 text-sm font-semibold text-stone-500 hover:text-teal-700"
        >
          Ввести другой e-mail
        </button>
      )}
    </form>
  );
}
