import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/profile", "/login", "/board/new", "/auth"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
