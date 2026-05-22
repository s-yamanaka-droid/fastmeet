import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fastmeet.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/book/yamanaka/30min`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/book/yamanaka/45min`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/book/yamanaka/60min`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.3 },
  ];
}
