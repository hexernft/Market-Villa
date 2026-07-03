"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Lock, Loader2, Palette, Pencil, Store } from "lucide-react";
import {
  BusinessThemeExtension,
  ThemeEditorBusiness,
  canEditProTheme,
  getBusinessThemeEditorData,
  getPurchasedThemeExtensions,
} from "@/lib/theme-editor-actions";

export default function ThemeEditorPage() {
  const [businesses, setBusinesses] = useState<ThemeEditorBusiness[]>([]);
  const [extensions, setExtensions] = useState<BusinessThemeExtension[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        setIsLoading(true);
        const data = await getBusinessThemeEditorData();

        if (!mounted) return;

        setBusinesses(data.businesses);
        setExtensions(data.extensions);
        setSelectedBusinessId(data.businesses[0]?.id || "");
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Unable to load theme editor.");
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleBusinessChange(businessId: string) {
    setSelectedBusinessId(businessId);
    setMessage("");

    try {
      setExtensions(await getPurchasedThemeExtensions(businessId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to load extensions.");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[55vh] place-items-center">
        <Loader2 className="animate-spin text-[#7c3aed]" size={26} />
      </main>
    );
  }

  if (!businesses.length) {
    return (
      <section className="rounded-3xl border border-[#eadfff] bg-white p-6 text-center">
        <h1 className="text-xl font-black text-[#241436]">Create your business page first</h1>
        <Link href="/dashboard/onboarding" className="mt-5 inline-flex rounded-2xl bg-[#241436] px-5 py-3 text-sm font-black text-white">
          Start Onboarding
        </Link>
      </section>
    );
  }

  const cards = [
    {
      id: "suya-spot-pro",
      name: "Suya Spot Pro",
      kind: "Food and grill Pro theme",
      preview: "from-[#1a0d05] via-[#5f2307] to-[#f59e0b]",
    },
    {
      id: "premium-treats",
      name: "Premium Treats",
      kind: "Premium catalog theme",
      preview: "from-[#06261c] via-[#b8892f] to-[#fffaf0]",
    },
  ];

  return (
    <div className="grid gap-5">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
            Pro Theme Editor
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#241436]">
            Customize purchased themes
          </h1>
        </div>
        <Link href="/dashboard/theme-store" className="inline-flex rounded-2xl border border-[#eadfff] bg-white px-4 py-2 text-sm font-black text-[#241436]">
          Theme Store
        </Link>
      </section>

      <section className="rounded-3xl border border-[#eadfff] bg-white p-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-[#241436]">Business</span>
          <select
            value={selectedBusinessId}
            onChange={(event) => handleBusinessChange(event.target.value)}
            className="min-h-12 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} - /store/{business.slug}
              </option>
            ))}
          </select>
        </label>
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-3 text-sm font-bold text-[#7c2d12]">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        {cards.map((theme) => {
          const canEdit = canEditProTheme({
            business: selectedBusiness,
            themeId: theme.id,
            extensions,
          });

          return (
            <article key={theme.id} className="overflow-hidden rounded-3xl border border-[#eadfff] bg-white">
              <div className={`h-36 bg-gradient-to-br ${theme.preview}`} />
              <div className="grid gap-4 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-black text-[#241436]">{theme.name}</h2>
                    <p className="mt-1 text-sm font-bold text-[#6f6785]">{theme.kind}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-black ${canEdit ? "bg-emerald-50 text-emerald-700" : "bg-[#f4edff] text-[#7c3aed]"}`}>
                    {canEdit ? <Palette size={14} /> : <Lock size={14} />}
                    {canEdit ? "Active" : "Locked"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {canEdit ? (
                    <Link href={`/dashboard/theme-editor/${theme.id}?businessId=${selectedBusinessId}`} className="inline-flex items-center gap-2 rounded-2xl bg-[#241436] px-4 py-2 text-sm font-black text-white">
                      <Pencil size={15} />
                      Edit Theme
                    </Link>
                  ) : (
                    <Link href="/dashboard/theme-store" className="inline-flex items-center gap-2 rounded-2xl bg-[#7c3aed] px-4 py-2 text-sm font-black text-white">
                      <Store size={15} />
                      Purchase Theme
                    </Link>
                  )}
                  {selectedBusiness ? (
                    <Link href={`/store/${selectedBusiness.slug}`} className="inline-flex rounded-2xl border border-[#eadfff] bg-white px-4 py-2 text-sm font-black text-[#241436]">
                      View Storefront
                    </Link>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
