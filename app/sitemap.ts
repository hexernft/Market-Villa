import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL;

  if (!configuredUrl) return "https://market-villa.vercel.app";

  return configuredUrl.startsWith("http")
    ? configuredUrl.replace(/\/$/, "")
    : `https://${configuredUrl.replace(/\/$/, "")}`;
}

function staticRoutes(siteUrl: string): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/stores`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${siteUrl}/terms`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/status`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const routes = staticRoutes(siteUrl);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return routes;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase
      .from("businesses")
      .select("slug, updated_at, created_at")
      .eq("is_published", true)
      .order("updated_at", { ascending: false });

    if (error || !data) {
      return routes;
    }

    return [
      ...routes,
      ...data
        .filter((business) => business.slug)
        .map((business) => ({
          url: `${siteUrl}/store/${business.slug}`,
          lastModified: new Date(
            business.updated_at || business.created_at || Date.now(),
          ),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        })),
    ];
  } catch {
    return routes;
  }
}
