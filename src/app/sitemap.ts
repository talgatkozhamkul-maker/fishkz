import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/constants";
import { getAllWaters, getFishSpecies, getPages, getRegions } from "@/lib/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [regions, waters, species, pages] = await Promise.all([
    getRegions(),
    getAllWaters(),
    getFishSpecies(),
    getPages(),
  ]);

  return [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/board`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${SITE_URL}/fish`, changeFrequency: "weekly", priority: 0.6 },
    ...regions.map((r) => ({
      url: `${SITE_URL}/regions/${r.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...waters.map((w) => ({
      url: `${SITE_URL}/water/${w.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...species.map((s) => ({
      url: `${SITE_URL}/fish/${s.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...pages.map((p) => ({
      url: `${SITE_URL}/pages/${p.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
