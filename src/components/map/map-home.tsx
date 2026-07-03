"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LocateFixed, Navigation, X } from "lucide-react";
import { WATER_TYPE_LABELS } from "@/lib/constants";
import { SearchForm } from "@/components/search-form";
import { BottomSheet } from "./bottom-sheet";
import type { MapWater } from "./types";

const MapView = dynamic(() => import("./map-view").then((m) => m.MapView), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-teal-50">
      <p className="animate-pulse text-sm font-semibold text-teal-700">
        Загружаем карту…
      </p>
    </div>
  ),
});

// Центр Казахстана — стартовая точка, пока геолокация не определилась
const KZ_CENTER: [number, number] = [66.92, 48.02];
const KZ_ZOOM = 4.2;

export function MapHome({
  waters,
  children,
}: {
  waters: MapWater[];
  children: ReactNode;
}) {
  const [center, setCenter] = useState<[number, number]>(KZ_CENTER);
  const [zoom, setZoom] = useState(KZ_ZOOM);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [snap, setSnap] = useState(1); // при первом открытии — половина экрана
  const gpsLocked = useRef(false); // GPS приоритетнее IP

  const locateGps = useCallback((interactive: boolean) => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        gpsLocked.current = true;
        const p: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setUserPos(p);
        setCenter(p);
        setZoom(11);
      },
      () => {
        // отказ или ошибка — остаёмся на IP/дефолте; при явном клике не ругаемся
        if (interactive) return;
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 },
    );
  }, []);

  useEffect(() => {
    // 1) мгновенно — грубая позиция по IP (заголовки Vercel)
    fetch("/api/geo")
      .then((r) => r.json())
      .then((geo: { lat: number | null; lng: number | null }) => {
        if (gpsLocked.current || geo.lat === null || geo.lng === null) return;
        setCenter([geo.lng, geo.lat]);
        setZoom(9);
      })
      .catch(() => {});
    // 2) параллельно — точный GPS (браузер спросит разрешение)
    locateGps(false);
  }, [locateGps]);

  const selected = useMemo(
    () => waters.find((w) => w.id === selectedId) ?? null,
    [waters, selectedId],
  );

  const onSelect = useCallback((id: string | null) => {
    setSelectedId(id);
    if (id) setSnap((s) => (s === 0 ? 1 : s));
  }, []);

  return (
    <>
      {/* Карта на весь экран под шапкой */}
      <div className="fixed inset-x-0 bottom-0 top-[52px] z-10 sm:left-[400px]">
        <MapView
          waters={waters}
          center={center}
          zoom={zoom}
          userPos={userPos}
          selectedId={selectedId}
          onSelect={onSelect}
        />
        <button
          type="button"
          onClick={() => locateGps(true)}
          aria-label="Показать где я"
          className="absolute right-2.5 top-24 z-20 flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-700 shadow-md ring-1 ring-stone-200 transition hover:bg-teal-50"
        >
          <LocateFixed size={20} aria-hidden />
        </button>
      </div>

      <BottomSheet
        snap={snap}
        onSnapChange={setSnap}
        topSlot={
          selected ? (
            <div className="rounded-2xl bg-white p-3.5 ring-1 ring-stone-200">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-stone-400">
                    {WATER_TYPE_LABELS[selected.water_type]}
                    {selected.region_name && ` · ${selected.region_name}`}
                    {selected.is_paid && " · платный"}
                  </p>
                  <h2 className="truncate font-extrabold text-stone-900">
                    {selected.name}
                  </h2>
                  {selected.fish.length > 0 && (
                    <p className="mt-0.5 truncate text-sm text-stone-600">
                      <span className="text-stone-400">Клюёт: </span>
                      {selected.fish.join(", ")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedId(null)}
                  aria-label="Закрыть карточку"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>
              <div className="mt-2.5 flex gap-2">
                <Link
                  href={`/water/${selected.slug}`}
                  className="inline-flex min-h-11 flex-1 items-center justify-center rounded-xl bg-teal-700 px-3 text-sm font-bold text-white transition hover:bg-teal-800"
                >
                  Открыть карточку
                </Link>
                <a
                  href={`https://2gis.kz/geo/${selected.lng},${selected.lat}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-xl bg-white px-3 text-sm font-bold text-stone-700 ring-1 ring-stone-300 transition hover:bg-stone-50"
                >
                  <Navigation size={15} aria-hidden />
                  Маршрут
                </a>
              </div>
            </div>
          ) : (
            <SearchForm />
          )
        }
      >
        {children}
      </BottomSheet>
    </>
  );
}
