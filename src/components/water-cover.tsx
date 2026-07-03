import type { WaterType } from "@/lib/types";

// Процедурная SVG-обложка водоёма: у демо-данных нет фото, поэтому каждая
// карточка получает аккуратную «акварельную» сцену в палитре своего типа.
// Оттенок детерминированно варьируется от slug — карточки не сливаются.

const PALETTES: Record<WaterType, { sky: string; far: string; water: string; deep: string }> = {
  lake: { sky: "#ccfbf1", far: "#5eead4", water: "#14b8a6", deep: "#0f766e" },
  river: { sky: "#e0f2fe", far: "#7dd3fc", water: "#0ea5e9", deep: "#0369a1" },
  reservoir: { sky: "#cffafe", far: "#67e8f9", water: "#06b6d4", deep: "#155e75" },
  pond: { sky: "#ecfccb", far: "#bef264", water: "#65a30d", deep: "#3f6212" },
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function WaterCover({
  type,
  seed,
  className,
}: {
  type: WaterType;
  seed: string;
  className?: string;
}) {
  const p = PALETTES[type];
  const h = hash(seed);
  // детерминированные вариации: фаза волн, положение солнца, высота гор
  const phase = (h % 40) / 10;
  const sunX = 55 + (h % 35);
  const hill1 = 34 + (h % 8);
  const hill2 = 40 + ((h >> 3) % 8);

  const wave = (y: number, amp: number, ph: number) => {
    let d = `M 0 ${y}`;
    for (let x = 0; x <= 160; x += 20) {
      const dy = amp * Math.sin((x / 40) * Math.PI + ph);
      d += ` Q ${x + 10} ${y + dy * 2} ${x + 20} ${y}`;
    }
    return d + " L 160 90 L 0 90 Z";
  };

  return (
    <svg
      viewBox="0 0 160 90"
      className={className}
      aria-hidden
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="160" height="90" fill={p.sky} />
      <circle cx={sunX} cy="20" r="9" fill="#fef3c7" opacity="0.9" />
      <circle cx={sunX} cy="20" r="5" fill="#fde68a" />
      {/* дальний берег */}
      <path
        d={`M 0 ${hill1 + 12} Q 30 ${hill1} 60 ${hill1 + 9} T 120 ${hill1 + 7} T 160 ${hill1 + 10} L 160 60 L 0 60 Z`}
        fill={p.far}
        opacity="0.8"
      />
      <path
        d={`M 0 ${hill2 + 12} Q 40 ${hill2 + 2} 80 ${hill2 + 10} T 160 ${hill2 + 8} L 160 65 L 0 65 Z`}
        fill={p.far}
      />
      {/* вода */}
      <path d={wave(52, 1.2, phase)} fill={p.water} />
      <path d={wave(60, 1.6, phase + 1.5)} fill={p.deep} opacity="0.55" />
      <path d={wave(72, 1.2, phase + 3)} fill={p.deep} opacity="0.75" />
      {/* блики */}
      <g stroke="#ffffff" strokeWidth="1.1" strokeLinecap="round" opacity="0.5">
        <path d={`M ${20 + (h % 20)} 57 h 12`} />
        <path d={`M ${70 + (h % 25)} 64 h 16`} />
        <path d={`M ${35 + (h % 30)} 71 h 10`} />
      </g>
    </svg>
  );
}
