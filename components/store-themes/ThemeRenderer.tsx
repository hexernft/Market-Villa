"use client";

import { DefaultOnePageTheme } from "@/components/store-themes/DefaultOnePageTheme";

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
  return (
    <DefaultOnePageTheme
      business={business}
      products={products}
      services={services}
    />
  );
}
