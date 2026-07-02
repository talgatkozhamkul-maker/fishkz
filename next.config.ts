import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Разрешаем загрузку фото из хранилища Supabase Storage.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "wtkfzhwyresejyuhqdym.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
