"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Eye,
  Loader2,
  Palette,
  Sparkles,
} from "lucide-react";
import { ThemePreviewCard } from "@/components/ThemePreviewCard";
import { getMyBusinesses, updateBusinessTheme } from "@/lib/business-actions";
import { availableThemes } from "@/lib/mock-data";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
};

export default function ThemePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedTheme = useMemo(() => {
    return (
      availableThemes.find((theme) => theme.id === selectedThemeId) ||
      availableThemes[0]
    );
  }, [selectedThemeId]);

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
          setSelectedThemeId(items[0].theme_id || availableThemes[0].id);
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

  useEffect(() => {
    if (!selectedBusiness) return;

    setSelectedThemeId(selectedBusiness.theme_id || availableThemes[0].id);
  }, [selectedBusiness]);

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

      setMessage("Theme updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update theme.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading theme settings...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-amber-950">
          Create your business page first
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-900">
          You need to complete onboarding before choosing a storefront theme.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-4 text-sm font-semibold text-amber-950 hover:bg-amber-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
              Theme Studio
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Give each business page a unique look.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Choose a professional theme that matches the business category,
              audience, and brand feeling.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current Selection
            </p>

            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-slate-950 text-white">
                  <Palette size={19} />
                </span>

                <div>
                  <p className="text-sm font-semibold">{selectedTheme.name}</p>
                  <p className="text-xs text-slate-500">
                    {selectedBusiness?.name}
                  </p>
                </div>
              </div>
            </div>

            <Link
              href={`/store/${selectedBusiness?.slug}`}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-300 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-amber-200"
            >
              <Eye size={17} />
              Preview Store
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Active Business
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Choose which business theme to edit
            </h3>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950 md:min-w-80"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} â€” /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div>
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Storefront Themes
            </p>

            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Select a storefront style
            </h2>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {availableThemes.map((theme) => (
              <button
                key={theme.id}
                type="button"
                onClick={() => setSelectedThemeId(theme.id)}
                className="text-left"
              >
                <ThemePreviewCard
                  theme={theme}
                  selected={selectedThemeId === theme.id}
                />
              </button>
            ))}
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Sparkles size={20} />
              </span>

              <div>
                <h3 className="font-semibold text-slate-950">
                  Selected Theme
                </h3>
                <p className="text-sm text-slate-500">{selectedTheme.name}</p>
              </div>
            </div>

            <p className="text-sm leading-6 text-slate-500">
              {selectedTheme.description}
            </p>

            <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-slate-200">
              <div
                className={`h-40 bg-gradient-to-br ${selectedTheme.hero}`}
              />

              <div className="bg-white p-5">
                <p className="text-sm font-semibold text-slate-950">
                  {selectedBusiness?.name}
                </p>

                <p className="mt-2 text-xs leading-5 text-slate-500">
                  This is a small preview of how the theme mood will feel on the
                  public business page.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={isSaving}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {isSaving ? "Saving theme..." : "Save Theme"}
            </button>
          </div>

          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6">
            <h3 className="text-lg font-semibold text-amber-950">
              Theme tip
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Use warm themes for food, luxury themes for fashion or apartments,
              and navy or emerald themes for corporate businesses.
            </p>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-slate-950 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-200">
              Later upgrade
            </p>

            <h3 className="mt-3 text-2xl font-semibold tracking-[-0.04em]">
              Custom colors
            </h3>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Later, Pro businesses can choose custom colors beyond the default
              Market Villa themes.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}
