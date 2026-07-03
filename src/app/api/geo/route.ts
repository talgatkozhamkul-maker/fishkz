import type { NextRequest } from "next/server";

// Геопозиция по IP: Vercel добавляет координаты в заголовки каждого запроса —
// бесплатно и без внешних сервисов. Используется как быстрый центр карты,
// пока браузер спрашивает разрешение на точный GPS.
export async function GET(request: NextRequest) {
  const lat = parseFloat(request.headers.get("x-vercel-ip-latitude") ?? "");
  const lng = parseFloat(request.headers.get("x-vercel-ip-longitude") ?? "");
  const city = request.headers.get("x-vercel-ip-city");

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return Response.json({
      lat,
      lng,
      city: city ? decodeURIComponent(city) : null,
      source: "ip",
    });
  }
  return Response.json({ lat: null, lng: null, city: null, source: "none" });
}
