"use client";

import { DefaultOnePageTheme } from "@/components/store-themes/DefaultOnePageTheme";
import { PremiumTreatsTheme } from "@/components/store-themes/PremiumTreatsTheme";
import { SuyaSpotProTheme } from "@/components/store-themes/SuyaSpotProTheme";

type ThemeRendererProps = {
  business: any;
  products?: any[] | null;
  services?: any[] | null;
};

export function ThemeRenderer({
  business,
  products,
  services,
}: ThemeRendererProps) {
  const themeId =
    business?.theme_id || business?.theme_settings?.themeId || "default-one-page";

  if (themeId === "premium-treats") {
    return <PremiumTreatsTheme business={business} products={products} />;
  }

  if (themeId === "suya-spot-pro") {
    return <SuyaSpotProTheme business={business} products={products} />;
  }

  return (
    <DefaultOnePageTheme
      business={business}
      products={products}
      services={services}
    />
  );
}
