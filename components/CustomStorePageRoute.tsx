"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Store } from "lucide-react";
import { ThemeRenderer } from "@/components/store-themes/ThemeRenderer";
import { getPublicBusinessPageBySlug } from "@/lib/business-actions";
import { StorePageId } from "@/lib/store-pages";

type StoreRouteParams = Promise<{
  slug: string;
}>;

type Props = {
  params: StoreRouteParams;
  page: StorePageId;
};

export function CustomStorePageRoute({ params, page }: Props) {
  const { slug } = use(params);
  const [business, setBusiness] = useState<any>(null);
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

  if (isLoading) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-slate-100 px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-[#26143d] text-white">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Loading store
          </h1>
        </div>
      </main>
    );
  }

  if (!business) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-slate-100 px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-red-50 text-red-700">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Store not found
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  if (!business.is_published) {
    return (
      <main className="market-villa-customized-store grid min-h-screen place-items-center bg-slate-100 px-5 py-10">
        <div className="w-full max-w-sm rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-soft">
          <div className="mx-auto mb-5 grid h-10 w-12 place-items-center rounded-2xl bg-purple-50 text-purple-700">
            <Store size={22} />
          </div>
          <h1 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
            Store currently unavailable
          </h1>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Back to Market Villa
          </Link>
        </div>
      </main>
    );
  }

  return <ThemeRenderer business={business} products={business.products || []} />;
}
