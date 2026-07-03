import type { NextConfig } from "next";

// Хост Supabase выводится из env (рекомендация аудита: не хардкодить проект).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL не задан — проверьте .env.local");
}
const supabaseHost = new URL(supabaseUrl).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHost,
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // 'unsafe-inline' для стилей — требование Tailwind/Next inline-стилей
              "style-src 'self' 'unsafe-inline'",
              // 'unsafe-eval' нужен только React DevTools в режиме разработки;
              // в продакшн-сборке не добавляется
              process.env.NODE_ENV === "development"
                ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
                : "script-src 'self' 'unsafe-inline'",
              // blob: — спрайты/иконки MapLibre; tiles.openfreemap.org — тайлы карты
              `img-src 'self' data: blob: https://${supabaseHost}`,
              `connect-src 'self' https://${supabaseHost} https://tiles.openfreemap.org`,
              // MapLibre рендерит в web worker из blob
              "worker-src 'self' blob:",
              "child-src blob:",
              "font-src 'self'",
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
