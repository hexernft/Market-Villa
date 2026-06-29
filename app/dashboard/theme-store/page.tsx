"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Palette } from "lucide-react";
import { getMyBusinesses, updateBusinessTheme } from "@/lib/business-actions";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
  subscription_plan?: string | null;
};

const defaultTheme = {
  id: "default-one-page",
  name: "Default One Page",
  price: 0,
  status: "active/free/default",
};

export default function ThemeStorePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState(defaultTheme.id);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      try {
        setIsLoading(true);

        const items = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(items);

        if (items.length > 0) {
          setSelectedBusinessId(items[0].id);
          setSelectedThemeId(defaultTheme.id);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load businesses.";
        setMessage(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSaveTheme() {
    if (!selectedBusinessId) {
      setMessage("Create a business page first before choosing a theme.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await updateBusinessTheme({
        businessId: selectedBusinessId,
        themeId: selectedThemeId,
      });

      const updatedBusinesses = await getMyBusinesses();
      setBusinesses(updatedBusinesses);
      setMessage("Theme applied successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to apply theme.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-6 text-center">
          <Loader2 className="mx-auto animate-spin text-[#241436]" size={24} />
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border border-purple-200 bg-purple-50 p-6 text-center">
        <p className="text-xl font-black tracking-[-0.04em] text-purple-950">
          Create your business page first
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-purple-300 px-5 py-2.5 text-sm font-black text-purple-950"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section>
        <h1 className="text-[1.8rem] font-black tracking-[-0.05em] text-[#171421]">
          Themes
        </h1>
      </section>

      <section className="rounded-2xl border border-[#ebe7f3] bg-white p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.7fr_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">
              Apply to business
            </span>
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm font-semibold text-[#241436] outline-none focus:border-[#7c3aed]"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-bold text-slate-700">
              Theme name
            </span>
            <select
              value={selectedThemeId}
              onChange={(event) => setSelectedThemeId(event.target.value)}
              className="min-h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm font-semibold text-[#241436] outline-none focus:border-[#7c3aed]"
            >
              <option value={defaultTheme.id}>{defaultTheme.name}</option>
            </select>
          </label>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={isSaving || !selectedBusiness}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-5 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {isSaving ? "Applying..." : "Apply Theme"}
          </button>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="rounded-2xl border border-[#ebe7f3] bg-white p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
            <Palette size={22} />
          </span>
          <div>
            <h2 className="text-lg font-black tracking-[-0.04em] text-[#171421]">
              {defaultTheme.name}
            </h2>
            <p className="mt-1 text-sm font-bold text-emerald-700">
              ₦{defaultTheme.price} · {defaultTheme.status}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
