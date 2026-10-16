import type { MetadataRoute } from "next";
import { getPublishedTerms } from "@/lib/terms";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default function sitemap(): MetadataRoute.Sitemap {
  const terms = getPublishedTerms();
  const latest = terms[0]?.date;
  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/thuat-ngu"), lastModified: latest, changeFrequency: "daily", priority: 0.8 },
    ...terms.map((t) => ({
      url: absoluteUrl(`/thuat-ngu/${t.slug}`),
      lastModified: t.updated ?? t.date,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
