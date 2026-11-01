import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/defaults";
import { getAllPublishedSlugs, getActiveCategories, getPhotography } from "@/services/content";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const [projects, categories, photos] = await Promise.all([
    getAllPublishedSlugs(),
    getActiveCategories(),
    getPhotography({ limit: 1 }),
  ]);
  const now = new Date();
  const staticPages = ["", "/work", "/about", "/services", "/experience", "/contact", ...(photos.length ? ["/photography"] : [])];

  return [
    ...staticPages.map((p) => ({
      url: `${base}${p}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: p === "" ? 1 : 0.7,
    })),
    ...categories.map((c) => ({
      url: `${base}/work/category/${c.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    ...projects.map((p) => ({
      url: `${base}/work/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
