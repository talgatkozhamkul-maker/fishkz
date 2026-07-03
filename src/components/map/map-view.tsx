"use client";

import { useEffect, useRef } from "react";
import maplibregl, { Map as MLMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { MapWater } from "./types";

// Карта на MapLibre GL + бесплатные векторные тайлы OpenFreeMap (OSM).
// Позже можно заменить на тайлы 2ГИС (MapGL API, нужен ключ) — см. BACKLOG.
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

const TYPE_COLORS: Record<string, string> = {
  lake: "#0d9488",
  river: "#0284c7",
  reservoir: "#0891b2",
  pond: "#65a30d",
};

export function MapView({
  waters,
  center,
  zoom,
  userPos,
  selectedId,
  onSelect,
}: {
  waters: MapWater[];
  center: [number, number];
  zoom: number;
  userPos: [number, number] | null;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const markersRef = useRef(new globalThis.Map<string, Marker>());
  const userMarkerRef = useRef<Marker | null>(null);
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // Инициализация карты — один раз
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URL,
      center,
      zoom,
      attributionControl: { compact: true },
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.on("click", () => onSelectRef.current(null));
    mapRef.current = map;

    for (const w of waters) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", w.name);
      el.className = "fishkz-marker";
      el.style.setProperty("--marker-color", TYPE_COLORS[w.water_type] ?? "#0d9488");
      el.innerHTML =
        '<svg viewBox="0 0 24 24" width="15" height="15" fill="white" aria-hidden="true"><path d="M6.5 12c2.5-3.5 6-5 10.5-5-1 1.7-1 3.3 0 5-1 1.7-1 3.3 0 5-4.5 0-8-1.5-10.5-5Zm-4.5 0 3.5-2.5v5L2 12Z"/><circle cx="14" cy="10.6" r="1" fill="var(--marker-color)"/></svg>';
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(w.id);
        map.flyTo({ center: [w.lng, w.lat], zoom: Math.max(map.getZoom(), 9), speed: 1.6 });
      });
      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([w.lng, w.lat])
        .addTo(map);
      markersRef.current.set(w.id, marker);
    }

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
      userMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Перелёт при смене центра (GPS/IP определился)
  useEffect(() => {
    mapRef.current?.flyTo({ center, zoom, speed: 1.8 });
  }, [center, zoom]);

  // Точка «вы здесь»
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !userPos) return;
    if (!userMarkerRef.current) {
      const el = document.createElement("div");
      el.className = "fishkz-user-dot";
      el.setAttribute("aria-label", "Вы здесь");
      userMarkerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat(userPos)
        .addTo(map);
    } else {
      userMarkerRef.current.setLngLat(userPos);
    }
  }, [userPos]);

  // Подсветка выбранной метки
  useEffect(() => {
    for (const [id, marker] of markersRef.current) {
      marker.getElement().classList.toggle("fishkz-marker-active", id === selectedId);
    }
  }, [selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
