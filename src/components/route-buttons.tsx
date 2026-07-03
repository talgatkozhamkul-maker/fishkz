import { Navigation } from "lucide-react";

// Кнопки маршрута: 2ГИС — основной сервис навигации в Казахстане (вывод
// аудита UX), Google Maps — запасной. Карты не встраиваем (решение SPEC).
export function RouteButtons({ lat, lng }: { lat: number; lng: number }) {
  const dgis = `https://2gis.kz/geo/${lng},${lat}`;
  const google = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={dgis}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 font-bold text-white transition hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-teal-600 sm:flex-none"
      >
        <Navigation size={18} aria-hidden />
        Маршрут в 2ГИС
      </a>
      <a
        href={google}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-white px-4 font-bold text-stone-700 ring-1 ring-stone-300 transition hover:bg-stone-50 sm:flex-none"
      >
        Google Maps
      </a>
      <span className="w-full text-xs text-stone-400 sm:w-auto">
        {lat.toFixed(4)}, {lng.toFixed(4)}
      </span>
    </div>
  );
}
