"use client";

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
import { canUseThemeForPlan, getThemeLimitForPlan } from "@/lib/plans";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
  subscription_plan?: string | null;
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

  const selectedBusinessThemeLimit = getThemeLimitForPlan(
    selectedBusiness?.subscription_plan,
  );

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
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />

          <p className="mt-3 text-sm text-slate-500">
            Loading theme settings...
          </p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[1.5rem] border border-purple-200 bg-purple-50 p-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.04em] text-purple-950">
          Create your business page first
        </p>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-purple-900">
          Complete onboarding before choosing a storefront theme.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-purple-300 px-5 py-2.5 text-sm font-semibold text-purple-950 transition hover:-translate-y-0.5 hover:bg-purple-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100 md:min-w-72"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>

            <Link
              href={`/store/${selectedBusiness?.slug}`}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Eye size={17} />
              Preview Store
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Theme</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-950">
                {selectedTheme.name}
              </p>
            </div>

            <div className="rounded-2xl bg-teal-50 px-3 py-2.5">
              <p className="text-xs text-teal-700">Business</p>
              <p className="mt-1 truncate text-sm font-semibold text-teal-950">
                {selectedBusiness?.name}
              </p>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.65fr]">
        <div className="grid content-start gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-700">
                Storefront Themes
              </p>

              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Select a storefront style
              </h2>
            </div>

            <p className="text-sm text-slate-500">
              {selectedBusinessThemeLimit} of {availableThemes.length} themes available
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableThemes.map((theme, index) => {
              const isLocked = !canUseThemeForPlan({
                plan: selectedBusiness?.subscription_plan,
                themeIndex: index,
              });

              return (
              <button
                key={theme.id}
                type="button"
                onClick={() => {
                  if (isLocked) {
                    setMessage("Upgrade your plan to use this theme.");
                    return;
                  }

                  setSelectedThemeId(theme.id);
                }}
                className={`relative text-left transition ${
                  isLocked
                    ? "cursor-not-allowed opacity-55"
                    : "hover:-translate-y-0.5"
                }`}
              >
                <ThemePreviewCard
                  theme={theme}
                  selected={selectedThemeId === theme.id}
                />
                {isLocked ? (
                  <span className="absolute right-3 top-3 rounded-full bg-[#26143d] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Upgrade
                  </span>
                ) : null}
              </button>
            );
            })}
          </div>
        </div>

        <aside className="grid content-start gap-4">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Palette size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">
                  Selected Theme
                </p>
                <p className="text-sm text-slate-500">{selectedTheme.name}</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.25rem] border border-slate-200">
              <div className={`h-32 bg-gradient-to-br ${selectedTheme.hero}`} />

              <div className="bg-white p-4">
                <p className="text-sm font-semibold text-slate-950">
                  {selectedBusiness?.name}
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {selectedTheme.description}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={isSaving}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}

              {isSaving ? "Saving..." : "Save Theme"}
            </button>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                <Sparkles size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Theme Use</p>
                <p className="text-sm text-slate-500">Quick guide</p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="font-semibold text-slate-950">Warm:</span>{" "}
                <span className="text-slate-500">food and lifestyle</span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="font-semibold text-slate-950">Luxury:</span>{" "}
                <span className="text-slate-500">fashion and apartments</span>
              </div>

              <div className="rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="font-semibold text-slate-950">Navy:</span>{" "}
                <span className="text-slate-500">corporate businesses</span>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}

