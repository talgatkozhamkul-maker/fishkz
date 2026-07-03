"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Выдвижная «шторка» в стиле 2ГИС. Мобильный: три положения (свёрнута /
// половина экрана / развёрнута), тянется за ручку. Десктоп (sm+): боковая
// панель слева, без перетаскивания.
//
// snap: 0 — свёрнута (виден только верх с поиском), 1 — половина, 2 — целиком.

const COLLAPSED_VISIBLE = 132; // px видимой части в свёрнутом положении
const HALF_RATIO = 0.52; // доля экрана в среднем положении

export function BottomSheet({
  topSlot,
  children,
  snap,
  onSnapChange,
}: {
  topSlot?: ReactNode;
  children: ReactNode;
  snap: number;
  onSnapChange: (snap: number) => void;
}) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState<number | null>(null);
  const dragState = useRef({ startY: 0, startOffset: 0, moved: false });

  const snapOffset = useCallback((s: number) => {
    const h = window.innerHeight;
    if (s >= 2) return 0;
    if (s === 1) return Math.max(0, h * (1 - HALF_RATIO));
    return Math.max(0, h - COLLAPSED_VISIBLE);
  }, []);

  // Применяем позицию к DOM (transform), не перерисовывая React на каждый пиксель
  const applyOffset = useCallback((px: number, animate: boolean) => {
    const el = sheetRef.current;
    if (!el) return;
    el.style.transition = animate ? "transform 280ms cubic-bezier(.2,.9,.3,1)" : "none";
    el.style.transform = `translateY(${px}px)`;
  }, []);

  useEffect(() => {
    // На десктопе шторка — статичная панель, transform сбрасывается стилями
    if (window.matchMedia("(min-width: 640px)").matches) return;
    applyOffset(snapOffset(snap), true);
  }, [snap, snapOffset, applyOffset]);

  useEffect(() => {
    const onResize = () => {
      if (window.matchMedia("(min-width: 640px)").matches) {
        const el = sheetRef.current;
        if (el) el.style.transform = "";
      } else {
        applyOffset(snapOffset(snap), false);
      }
    };
    window.addEventListener("resize", onResize);
    onResize();
    return () => window.removeEventListener("resize", onResize);
  }, [snap, snapOffset, applyOffset]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (window.matchMedia("(min-width: 640px)").matches) return;
    dragState.current = {
      startY: e.clientY,
      startOffset: snapOffset(snap),
      moved: false,
    };
    setDragOffset(dragState.current.startOffset);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (dragOffset === null) return;
    const dy = e.clientY - dragState.current.startY;
    if (Math.abs(dy) > 4) dragState.current.moved = true;
    const next = Math.min(
      Math.max(0, dragState.current.startOffset + dy),
      window.innerHeight - COLLAPSED_VISIBLE,
    );
    setDragOffset(next);
    applyOffset(next, false);
  };

  const onPointerUp = () => {
    if (dragOffset === null) return;
    const offsets = [2, 1, 0].map((s) => ({ s, px: snapOffset(s) }));
    // тап по ручке без движения: свёрнута → половина
    if (!dragState.current.moved) {
      const target = snap === 0 ? 1 : snap;
      onSnapChange(target);
      applyOffset(snapOffset(target), true);
    } else {
      const nearest = offsets.reduce((a, b) =>
        Math.abs(b.px - dragOffset) < Math.abs(a.px - dragOffset) ? b : a,
      );
      onSnapChange(nearest.s);
      applyOffset(nearest.px, true);
    }
    setDragOffset(null);
  };

  return (
    <div
      ref={sheetRef}
      className="fixed inset-x-0 bottom-0 top-[52px] z-30 flex flex-col rounded-t-3xl bg-stone-50 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] sm:inset-auto sm:left-0 sm:top-[52px] sm:bottom-0 sm:w-[400px] sm:rounded-none sm:border-r sm:border-stone-200 sm:shadow-none"
      style={{ touchAction: "none" }}
    >
      {/* Ручка перетаскивания (только мобильный) */}
      <div
        role="slider"
        aria-label="Панель каталога: потяните вверх или вниз"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={snap}
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") onSnapChange(Math.min(2, snap + 1));
          if (e.key === "ArrowDown") onSnapChange(Math.max(0, snap - 1));
        }}
        className="flex shrink-0 cursor-grab items-center justify-center pb-1 pt-2.5 active:cursor-grabbing sm:hidden"
      >
        <div className="h-1.5 w-12 rounded-full bg-stone-300" />
      </div>

      {topSlot && <div className="shrink-0 px-4 pb-2">{topSlot}</div>}

      <div
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-24 sm:pb-6"
        style={{ touchAction: "pan-y" }}
      >
        {children}
      </div>
    </div>
  );
}
