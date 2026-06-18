"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Loader2, Palette, SlidersHorizontal } from "lucide-react";
import {
  getMyBusinesses,
  updateBusinessTheme,
  updateBusinessThemeSections,
} from "@/lib/business-actions";
import { availableThemes } from "@/lib/mock-data";
import {
  getBusinessTheme,
  getThemeSectionOptions,
  normalizeThemeSections,
} from "@/lib/themes";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
  theme_sections?: string[] | null;
  subscription_plan?: string | null;
};

const selectableThemes = availableThemes.filter(
  (theme) => theme.id === "simple-one-page",
);

export default function ThemePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [selectedThemeId, setSelectedThemeId] = useState("simple-one-page");
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingSections, setIsSavingSections] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedTheme = useMemo(() => {
    return (
      selectableThemes.find((theme) => theme.id === selectedThemeId) ||
      selectableThemes[0]
    );
  }, [selectedThemeId]);

  const activeBusinessTheme = useMemo(() => {
    return getBusinessTheme(selectedBusiness?.theme_id || "simple-one-page");
  }, [selectedBusiness?.theme_id]);

  const sectionOptions = useMemo(() => {
    return getThemeSectionOptions(activeBusinessTheme.id);
  }, [activeBusinessTheme.id]);

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
            items[0].theme_id === "simple-one-page"
              ? "simple-one-page"
              : "simple-one-page",
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

    setSelectedThemeId("simple-one-page");
    setSelectedSectionIds(
      normalizeThemeSections(
        selectedBusiness.theme_sections,
        selectedBusiness.theme_id || "simple-one-page",
      ),
    );
  }, [selectedBusiness]);

  function toggleSection(sectionId: string) {
    setSelectedSectionIds((sectionIds) => {
      if (sectionIds.includes(sectionId)) {
        return sectionIds.filter((item) => item !== sectionId);
      }

      return [...sectionIds, sectionId];
    });
  }

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

  async function handleSaveSections() {
    if (!selectedBusinessId) {
      setMessage("Create a business page first before customizing sections.");
      return;
    }

    setIsSavingSections(true);
    setMessage("");

    try {
      await updateBusinessThemeSections({
        businessId: selectedBusinessId,
        sectionIds: selectedSectionIds,
      });

      const updatedBusinesses = await getMyBusinesses();
      setBusinesses(updatedBusinesses);

      setMessage("Theme sections updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update theme sections.";

      setMessage(errorMessage);
    } finally {
      setIsSavingSections(false);
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

          <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
            <p className="text-xs text-slate-500">Current theme</p>
            <p className="mt-1 truncate text-sm font-semibold text-slate-950">
              {selectedTheme?.name || "Simple One Page"}
            </p>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
            <Palette size={19} />
          </span>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Theme
            </p>
            <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Select theme name
            </h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Theme name
            </span>

            <select
              value={selectedThemeId}
              onChange={(event) => setSelectedThemeId(event.target.value)}
              className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
            >
              {selectableThemes.map((theme) => (
                <option key={theme.id} value={theme.id}>
                  {theme.name}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={handleSaveTheme}
            disabled={isSaving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {isSaving ? "Saving..." : "Save Theme"}
          </button>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
          Other storefront designs are available in{" "}
          <Link
            href="/dashboard/theme-store"
            className="font-semibold text-[#6d28d9]"
          >
            Theme Store
          </Link>
          .
        </div>
      </section>

      <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-950 text-white">
              <SlidersHorizontal size={19} />
            </span>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Storefront Sections
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Customize {activeBusinessTheme.name}
              </h2>
            </div>
          </div>

          <span className="hidden rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-500 md:inline-flex">
            Hero is always shown
          </span>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {sectionOptions.map((section) => {
            const isSelected = selectedSectionIds.includes(section.id);

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => toggleSection(section.id)}
                className={`flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? "border-[#7c3aed] bg-purple-50 text-[#211331]"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <span
                  className={`mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border ${
                    isSelected
                      ? "border-[#7c3aed] bg-[#7c3aed] text-white"
                      : "border-slate-300 bg-white text-transparent"
                  }`}
                >
                  <CheckCircle2 size={15} />
                </span>

                <span>
                  <span className="block text-sm font-semibold">
                    {section.label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 opacity-70">
                    {section.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-slate-50 p-3 md:flex-row md:items-center md:justify-between">
          <p className="text-sm leading-6 text-slate-600">
            Turn off sections when the business does not have content for them.
            The store page will hide those areas from customers.
          </p>

          <button
            type="button"
            onClick={handleSaveSections}
            disabled={isSavingSections}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSavingSections ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <CheckCircle2 size={17} />
            )}
            {isSavingSections ? "Saving..." : "Save Sections"}
          </button>
        </div>
      </section>
    </div>
  );
}
