"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Crown,
  Loader2,
  Lock,
  Palette,
  Search,
  Store,
} from "lucide-react";
import { ThemePreviewCard } from "@/components/ThemePreviewCard";
import { getMyBusinesses, updateBusinessTheme } from "@/lib/business-actions";
import { availableThemes } from "@/lib/mock-data";
import {
  canUseBusinessModeForPlan,
  canUseThemeForPlan,
  getBusinessModePlanMessage,
} from "@/lib/plans";
import {
  getBusinessModeMeta,
  getThemeBusinessMode,
  normalizeBusinessMode,
} from "@/lib/business-modes";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
subscription_plan?: string | null;
};

const storeThemes = availableThemes.filter(
  (theme) =>
    theme.id !== "simple-one-page" &&
    theme.id !== "apartment-stay" &&
    theme.id !== "car-showroom",
);

const filters = [
  { label: "All", value: "all" },
  { label: "Retail", value: "retail" },
  { label: "Food", value: "food" },
  { label: "Luxury", value: "luxury" },
  { label: "Specialized", value: "specialized" },
];

function getFilter(theme: (typeof availableThemes)[number]) {
  const haystack = `${theme.id} ${theme.name} ${theme.description} ${theme.layout}`.toLowerCase();

  if (haystack.includes("food") || haystack.includes("grocery") || haystack.includes("catering")) {
    return "food";
  }

  if (
    haystack.includes("luxury") ||
    haystack.includes("beauty") ||
    haystack.includes("jewelry") ||
    haystack.includes("apartment") ||
    haystack.includes("furniture") ||
    haystack.includes("homeware") ||
    haystack.includes("decor") ||
    haystack.includes("lighting") ||
    haystack.includes("bedding") ||
    haystack.includes("skincare") ||
    haystack.includes("makeup") ||
    haystack.includes("fragrance")
  ) {
    return "luxury";
  }

  if (
    haystack.includes("kids") ||
    haystack.includes("baby") ||
    haystack.includes("toy") ||
    haystack.includes("school") ||
    haystack.includes("tech") ||
    haystack.includes("event") ||
    haystack.includes("pharmacy") ||
    haystack.includes("corporate") ||
    haystack.includes("car") ||
    haystack.includes("vehicle") ||
    haystack.includes("dealer") ||
    haystack.includes("showroom") ||
    haystack.includes("auto") ||
    haystack.includes("phone") ||
    haystack.includes("laptop") ||
    haystack.includes("gadget") ||
    haystack.includes("electronics")
  ) {
    return "specialized";
  }

  if (haystack.includes("runway") || haystack.includes("fashion") || haystack.includes("lookbook")) {
    return "retail";
  }

  return "retail";
}

function getThemeModeLabel(themeId: string) {
  return "Product Theme";
}

function getThemePriceLabel(theme: (typeof availableThemes)[number]) {
  return theme.priceLabel || "Price pending";
}

export default function ThemeStorePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [query, setQuery] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedTheme = useMemo(() => {
    return storeThemes.find((theme) => theme.id === selectedThemeId);
  }, [selectedThemeId]);

  const selectedMode = normalizeBusinessMode("products");
  const selectedModeMeta = getBusinessModeMeta(selectedMode);
  const isModeLocked = !canUseBusinessModeForPlan({
    mode: selectedMode,
    plan: selectedBusiness?.subscription_plan,
  });

  const visibleThemes = useMemo(() => {
    const search = query.toLowerCase().trim();

    return storeThemes.filter((theme) => {
      const matchesMode = getThemeBusinessMode(theme.id) === selectedMode;
      const matchesFilter =
        activeFilter === "all" || getFilter(theme) === activeFilter;
      const haystack = `${theme.name} ${theme.description} ${theme.bestFor || ""} ${
        theme.features?.join(" ") || ""
      }`.toLowerCase();
      const matchesSearch = !search || haystack.includes(search);

      return matchesMode && matchesFilter && matchesSearch;
    });
  }, [activeFilter, query, selectedMode]);

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
          setSelectedThemeId(
            items[0].theme_id === "simple-one-page" ? "" : items[0].theme_id,
          );
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

    setSelectedThemeId(
      selectedBusiness.theme_id === "simple-one-page"
        ? ""
        : selectedBusiness.theme_id || "",
    );
  }, [selectedBusiness]);

  async function handleSaveTheme() {
    if (!selectedBusinessId) {
      setMessage("Create a business page first before choosing a theme.");
      return;
    }

    if (!selectedThemeId) {
      setMessage("Select a theme from the store first.");
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
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />
          <p className="mt-3 text-sm text-slate-500">
            Loading theme store...
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
          Complete onboarding before choosing a premium storefront theme.
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
      <section className="overflow-hidden rounded-[1.75rem] border border-[#e6d9f2] bg-[#211331] text-white shadow-[0_24px_70px_rgba(36,20,54,0.18)]">
        <div className="grid gap-6 p-5 md:p-7 xl:grid-cols-[1fr_0.72fr] xl:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 ring-1 ring-white/15">
              <Crown size={14} />
              Theme Store
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.055em] md:text-5xl">
              {selectedModeMeta.themeLabel} for businesses that need more presence.
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70">
              Theme options are filtered by the selected business section:
              Products, Properties, or advanced business sections. Change the business mode from
              Profile when a business belongs somewhere else.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.35rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-2xl font-semibold">{visibleThemes.length}</p>
                <p className="mt-1 text-xs text-white/60">Themes</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-2xl font-semibold">
                  {selectedModeMeta.shortLabel}
                </p>
                <p className="mt-1 text-xs text-white/60">Section</p>
              </div>
              <div className="rounded-2xl bg-white/12 p-3">
                <p className="text-2xl font-semibold">Soon</p>
                <p className="mt-1 text-xs text-white/60">Pricing</p>
              </div>
            </div>

            <Link
              href="/dashboard/theme"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-[#211331]"
            >
              Back to Default Theme
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_0.75fr_auto] lg:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Apply to business
            </span>
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-xs text-slate-500">Selected theme</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {selectedTheme?.name || "Choose from store"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Showing {selectedModeMeta.themeLabel.toLowerCase()}.
            </p>
          </div>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={isSaving || !selectedThemeId}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
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
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      {isModeLocked ? (
        <section className="rounded-[1.35rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-950">
            {getBusinessModePlanMessage(selectedMode)}
          </p>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-amber-900">
            Upgrade to Pro to unlock {selectedModeMeta.themeLabel.toLowerCase()}
            and the matching inventory workflow.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white"
          >
            View Pro Plan
          </Link>
        </section>
      ) : null}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={17}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={`Search ${selectedModeMeta.themeLabel.toLowerCase()}`}
              className="min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-11 text-sm text-slate-950 outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-50"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter.value}
                type="button"
                onClick={() => setActiveFilter(filter.value)}
                className={`whitespace-nowrap rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  activeFilter === filter.value
                    ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-[#7c3aed]/40"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visibleThemes.map((theme) => {
          const themeIndex = availableThemes.findIndex(
            (item) => item.id === theme.id,
          );
          const themeModeLabel = getThemeModeLabel(theme.id);
          const isLocked =
            isModeLocked ||
            !canUseThemeForPlan({
              plan: selectedBusiness?.subscription_plan,
              themeIndex,
            });

          return (
            <div
              key={theme.id}
              className={`group relative transition ${
                isLocked ? "opacity-60" : "hover:-translate-y-0.5"
              }`}
            >
              <button
                type="button"
                onClick={() => {
                  if (isLocked) {
                    setMessage(
                      isModeLocked
                        ? getBusinessModePlanMessage(selectedMode)
                        : "Upgrade your plan to unlock this storefront theme.",
                    );
                    return;
                  }

                  setSelectedThemeId(theme.id);
                }}
                className={`w-full text-left ${
                  isLocked ? "cursor-not-allowed" : ""
                }`}
              >
                <ThemePreviewCard
                  theme={theme}
                  selected={selectedThemeId === theme.id}
                />
              </button>

              <div className="pointer-events-none absolute left-3 top-3 flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-xl bg-white px-3 py-1 text-xs font-semibold text-[#211331] shadow-sm">
                  <Store size={12} />
                  {themeModeLabel}
                </span>
                <span className="inline-flex rounded-xl bg-[#d9fff3] px-3 py-1 text-xs font-semibold text-[#032f2a] shadow-sm">
                  {getThemePriceLabel(theme)}
                </span>
              </div>

              {isLocked ? (
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-xl bg-[#26143d] px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  <Lock size={12} />
                  Pro
                </span>
              ) : null}

              <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-950 shadow-sm ring-1 ring-slate-200">
                <Store size={14} />
                Select
              </span>
            </div>
          );
        })}
      </section>

      {visibleThemes.length === 0 ? (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Palette className="mx-auto text-slate-400" size={28} />
          <p className="mt-3 text-sm font-semibold text-slate-900">
            No themes found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Try another category or search term.
          </p>
        </section>
      ) : null}
    </div>
  );
}
