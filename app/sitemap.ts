import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://fastmeet.vercel.app";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${base}/book/yamanaka`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/privacy`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/terms`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
