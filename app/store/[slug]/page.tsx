"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { StoreAiAssistant } from "@/components/StoreAiAssistant";
import { ThemeRenderer } from "@/components/store-themes/ThemeRenderer";
import { getPublicBusinessPageBySlug } from "@/lib/business-actions";

type StorePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PublicProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  image_url: string | null;
  is_available: boolean;
  is_featured: boolean;
  is_published?: boolean | null;
  item_type?: string | null;
  vehicle_status?: string | null;
  vehicle_details?: Record<string, any> | null;
  property_status?: string | null;
  property_details?: Record<string, any> | null;
};

type PublicBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  tagline: string | null;
  description: string | null;
  logo_text: string | null;
  logo_url: string | null;
  cover_image_url: string | null;
  whatsapp: string | null;
  phone: string | null;
  email: string | null;
  location: string | null;
  instagram_url: string | null;
  opening_hours: string | null;
  theme_id: string | null;
  theme_settings?: Record<string, any> | null;
  theme_sections: string[] | null;
  business_mode?: string | null;
  ai_assistant_enabled?: boolean | null;
  ai_assistant_status?: string | null;
  is_published: boolean;
  products: PublicProduct[];
};

export default function StorePage({ params }: StorePageProps) {
  const { slug } = use(params);
  const [business, setBusiness] = useState<PublicBusiness | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadBusiness() {
      setIsLoading(true);

      const data = await getPublicBusinessPageBySlug(slug);

      if (!mounted) return;

      setBusiness(data);
      setIsLoading(false);
    }

    loadBusiness();

    return () => {
      mounted = false;
    };
  }, [slug]);

  const visibleProducts = useMemo(() => {
    return (business?.products || []).filter((product) => {
      return product.is_available && product.is_published !== false;
    });
  }, [business?.products]);

  if (isLoading) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-[#fbf9ff] px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-[#eee7f7] bg-white p-6 text-center">
          <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-[#241436] text-white">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-black tracking-[-0.04em] text-[#211331]">
            Loading store
          </h1>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-[#fbf9ff] px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-[#eee7f7] bg-white p-6 text-center">
          <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-700">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-black tracking-[-0.04em] text-[#211331]">
            Store not found
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#241436] px-5 py-2.5 text-sm font-black text-white"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  if (!business.is_published) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-[#fbf9ff] px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-[#eee7f7] bg-white p-6 text-center">
          <div className="mx-auto mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-purple-50 text-purple-700">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-black tracking-[-0.04em] text-[#211331]">
            Store currently unavailable
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#241436] px-5 py-2.5 text-sm font-black text-white"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  const storeAiAssistant =
    business.ai_assistant_enabled && business.ai_assistant_status === "active" ? (
      <StoreAiAssistant businessId={business.id} businessName={business.name} />
    ) : null;

  return (
    <>
      <ThemeRenderer business={business} products={visibleProducts} />
      {storeAiAssistant}
    </>
  );
}
