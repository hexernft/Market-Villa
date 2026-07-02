"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { getPublicBusinessPageBySlug } from "@/lib/business-actions";
import { SuyaSpotProTheme } from "@/components/store-themes/SuyaSpotProTheme";

type Props = {
  mode: "home" | "grill";
};

const demoBusiness = {
  id: "suya-spot-demo",
  name: "S I S Suya Spot",
  slug: "suya-spot",
  tagline: "Hot Suya. Fresh Off The Grill.",
  description:
    "From single portions to party packs, S I S Suya Spot serves fresh grilled suya for every craving.",
  cover_image_url: "/suya/suya-hero.png",
  whatsapp: "2348036882822",
  phone: "2348036882822",
  location: "Gwarimpa, Abuja",
  opening_hours: "Open from 11:00 AM daily",
  theme_id: "suya-spot-pro",
  theme_settings: {
    heroImageUrl: "/suya/suya-hero.png",
  },
  products: [],
};

export function SuyaSpotRoute({ mode }: Props) {
  const [business, setBusiness] = useState<any>(demoBusiness);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      setIsLoading(true);

      const data =
        (await getPublicBusinessPageBySlug("suya-spot")) ||
        (await getPublicBusinessPageBySlug("sis-suya-spot"));

      if (!mounted) return;

      if (data) {
        setBusiness({
          ...demoBusiness,
          ...data,
          theme_id: "suya-spot-pro",
          theme_settings: {
            ...(demoBusiness.theme_settings || {}),
            ...((data as any).theme_settings || {}),
            themeId: "suya-spot-pro",
          },
        });
      }

      setIsLoading(false);
    }

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    return ((business as any)?.products || []).filter((product: any) => {
      return product.is_available !== false && product.is_published !== false;
    });
  }, [business]);

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#17120a] text-white">
        <Loader2 className="animate-spin text-[#facc15]" size={30} />
      </main>
    );
  }

  return (
    <SuyaSpotProTheme
      business={business}
      products={visibleProducts}
      mode={mode}
    />
  );
}
