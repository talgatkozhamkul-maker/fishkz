// Генерирует PNG-иконки приложения (PWA + apple-touch-icon) без зависимостей:
// рисует рыбку на градиенте попиксельно и кодирует PNG через node:zlib.
// Запуск: node scripts/gen-icons.mjs
import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// --- Мини-кодировщик PNG -----------------------------------------------------
const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePng(size, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // бит на канал
  ihdr[9] = 6; // RGBA
  // строки с фильтром 0
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

// --- Рисование иконки ---------------------------------------------------------
// Палитра: градиент «вода» + белая рыбка.
const TOP = [13, 148, 136]; // teal-600
const BOT = [19, 78, 74]; // teal-900

function drawIcon(size, { pad = 0 } = {}) {
  const img = Buffer.alloc(size * size * 4);
  const r = size * 0.22; // радиус скругления
  const s = 1 - pad * 2; // масштаб рыбки (для maskable-запаса)

  // координаты рыбки в единичном квадрате с учётом масштаба
  const tx = (u) => (u - 0.5) * s + 0.5;
  const bodyCx = tx(0.44), bodyCy = tx(0.5);
  const bodyRx = 0.26 * s, bodyRy = 0.165 * s;
  const eyeCx = tx(0.325), eyeCy = tx(0.455), eyeR = 0.032 * s;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size;
      const v = (y + 0.5) / size;
      const i = (y * size + x) * 4;

      // скруглённый квадрат (прозрачность за пределами)
      const dx = Math.max(r - x - 0.5, x + 0.5 - (size - r), 0);
      const dy = Math.max(r - y - 0.5, y + 0.5 - (size - r), 0);
      if (dx * dx + dy * dy > r * r) continue; // alpha 0

      // фон: вертикальный градиент
      let [R, G, B] = [0, 1, 2].map((k) => Math.round(TOP[k] + (BOT[k] - TOP[k]) * v));

      // волны: две светлые синусоиды в нижней трети
      for (const [baseY, amp, alpha] of [[0.78, 0.02, 60], [0.87, 0.018, 40]]) {
        const wave = tx(baseY) + amp * Math.sin(u * Math.PI * 4);
        if (Math.abs(v - wave) < 0.014 * s) {
          R = Math.round(R + (255 - R) * (alpha / 255));
          G = Math.round(G + (255 - G) * (alpha / 255));
          B = Math.round(B + (255 - B) * (alpha / 255));
        }
      }

      // рыбка: тело (эллипс) + хвост (треугольник)
      const be = ((u - bodyCx) / bodyRx) ** 2 + ((v - bodyCy) / bodyRy) ** 2;
      const tailU0 = bodyCx + bodyRx * 0.82;
      const inTail =
        u >= tailU0 &&
        u <= tailU0 + 0.17 * s &&
        Math.abs(v - bodyCy) <= ((u - tailU0) / (0.17 * s)) * 0.13 * s + 0.01;
      const inEye = ((u - eyeCx) / eyeR) ** 2 + ((v - eyeCy) / eyeR) ** 2 <= 1;

      if ((be <= 1 || inTail) && !inEye) {
        R = 255; G = 255; B = 255;
      }

      img[i] = R; img[i + 1] = G; img[i + 2] = B; img[i + 3] = 255;
    }
  }
  return encodePng(size, img);
}

mkdirSync(path.join(root, "public", "icons"), { recursive: true });
writeFileSync(path.join(root, "public", "icons", "icon-192.png"), drawIcon(192));
writeFileSync(path.join(root, "public", "icons", "icon-512.png"), drawIcon(512));
writeFileSync(path.join(root, "public", "icons", "icon-maskable-512.png"), drawIcon(512, { pad: 0.12 }));
writeFileSync(path.join(root, "src", "app", "apple-icon.png"), drawIcon(180));
console.log("Иконки сгенерированы: public/icons/* и src/app/apple-icon.png");
