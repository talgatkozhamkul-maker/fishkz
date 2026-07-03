"use client";

// Глобальный обработчик ошибок (по аудиту: сбой БД — это явная ошибка,
// а не тихий 404 или пустая страница).
export default function ErrorPage({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div aria-hidden className="text-6xl">
        🌊
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight">
        Что-то пошло не так
      </h1>
      <p className="max-w-sm text-sm leading-relaxed text-stone-500">
        Не удалось загрузить данные. Обычно помогает обновить страницу — база
        могла на секунду задуматься.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-2 inline-flex min-h-12 items-center rounded-xl bg-teal-700 px-5 font-bold text-white transition hover:bg-teal-800"
      >
        Попробовать снова
      </button>
    </div>
  );
}
