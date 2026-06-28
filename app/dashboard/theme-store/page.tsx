"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Palette,
  Search,
} from "lucide-react";
import { ThemePreviewCard } from "@/components/ThemePreviewCard";
import { ThemeStoreLivePreview } from "@/components/ThemeStoreLivePreview";
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
  const [previewZoom, setPreviewZoom] = useState(75);
  const [previewPan, setPreviewPan] = useState({ x: 0, y: 0 });
  const [isDraggingPreview, setIsDraggingPreview] = useState(false);
  const previewStageRef = useRef<HTMLDivElement | null>(null);
  const previewCanvasRef = useRef<HTMLDivElement | null>(null);
  const previewDragStartRef = useRef({
    pointerX: 0,
    pointerY: 0,
    panX: 0,
    panY: 0,
  });

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

  const previewScale = previewZoom / 100;

  const clampPreviewPan = useCallback((
    nextPan: { x: number; y: number },
    scale = previewScale,
  ) => {
    const stage = previewStageRef.current;
    const canvas = previewCanvasRef.current;

    if (!stage || !canvas) {
      return nextPan;
    }

    const stageWidth = stage.clientWidth;
    const stageHeight = stage.clientHeight;
    const canvasWidth = canvas.offsetWidth * scale;
    const canvasHeight = canvas.offsetHeight * scale;

    const minX = Math.min(0, stageWidth - canvasWidth);
    const maxX = Math.max(0, (stageWidth - canvasWidth) / 2);

    const minY = Math.min(0, stageHeight - canvasHeight);
    const maxY = 0;

    return {
      x:
        canvasWidth <= stageWidth
          ? Math.max(0, (stageWidth - canvasWidth) / 2)
          : Math.min(maxX, Math.max(minX, nextPan.x)),
      y:
        canvasHeight <= stageHeight
          ? 0
          : Math.min(maxY, Math.max(minY, nextPan.y)),
    };
  }, [previewScale]);

  function resetPreviewView() {
    setPreviewZoom(75);
    setPreviewPan({ x: 0, y: 0 });
  }

  function handlePreviewPointerDown(event: PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingPreview(true);

    previewDragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      panX: previewPan.x,
      panY: previewPan.y,
    };
  }

  function handlePreviewPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!isDraggingPreview) return;

    const dragStart = previewDragStartRef.current;

    const nextPan = {
      x: dragStart.panX + event.clientX - dragStart.pointerX,
      y: dragStart.panY + event.clientY - dragStart.pointerY,
    };

    setPreviewPan(clampPreviewPan(nextPan));
  }

  function handlePreviewPointerUp(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setIsDraggingPreview(false);
    setPreviewPan((current) => clampPreviewPan(current));
  }

  useEffect(() => {
    setPreviewPan((current) => clampPreviewPan(current, previewScale));
  }, [clampPreviewPan, previewScale]);

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
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
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

      <section className="rounded-[1.5rem] border border-[#e8e1f4] bg-white/72 p-4 shadow-[0_18px_55px_rgba(36,20,54,0.08)] backdrop-blur-xl">
        <div className="grid gap-4 xl:grid-cols-[24rem_minmax(0,1fr)]">
          <aside className="rounded-[1.25rem] border border-slate-200 bg-white p-4">

            <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#241436]">
              Choose a storefront theme
            </h2>

            <label className="mt-5 block">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                Theme name
              </span>

              <select
                value={selectedThemeId}
                onChange={(event) => setSelectedThemeId(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-950 outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-purple-50"
              >
                <option value="">Choose a theme</option>
                {visibleThemes.map((theme) => {
                  const themeIndex = availableThemes.findIndex(
                    (item) => item.id === theme.id,
                  );
                  const isLocked =
                    isModeLocked ||
                    !canUseThemeForPlan({
                      plan: selectedBusiness?.subscription_plan,
                      themeIndex,
                    });

                  return (
                    <option key={theme.id} value={theme.id} disabled={isLocked}>
                      {theme.name} {isLocked ? "â€” Pro" : ""}
                    </option>
                  );
                })}
              </select>
            </label>

            {selectedTheme ? (
              <div className="mt-5 rounded-2xl bg-[#f7f1ff] p-4">
                <p className="text-xs text-[#6f6785]">Selected theme</p>
                <p className="mt-1 text-base font-black text-[#241436]">
                  {selectedTheme.name}
                </p>
                <p className="mt-2 text-sm leading-6 text-[#6f6785]">
                  {selectedTheme.description}
                </p>

                {selectedTheme.bestFor ? (
                  <p className="mt-3 text-xs font-semibold text-[#7c3aed]">
                    Best for: {selectedTheme.bestFor}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                Select a theme to display the large storefront viewer.
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveTheme}
              disabled={isSaving || !selectedThemeId}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {isSaving ? "Applying..." : "Apply Theme"}
            </button>
          </aside>

          <div className="overflow-hidden rounded-[1.4rem] border border-slate-200 bg-slate-950 shadow-[0_18px_70px_rgba(15,23,42,0.16)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-slate-950 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
              </div>

              <div className="flex items-center gap-3">
                <label className="hidden items-center gap-2 text-xs font-semibold text-white/70 md:flex">
                  Zoom
                  <input
                    type="range"
                    min="45"
                    max="120"
                    value={previewZoom}
                    onChange={(event) => setPreviewZoom(Number(event.target.value))}
                    className="h-1 w-32 accent-white"
                  />
                  <span className="min-w-10 text-right text-white/70">
                    {previewZoom}%
                  </span>
                </label>

                <button
                  type="button"
                  onClick={resetPreviewView}
                  className="rounded-full border border-white/15 px-3 py-1 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                  Reset
                </button>
              </div>
            </div>

            <div ref={previewStageRef}
              className={`theme-preview-stage h-[680px] w-full overflow-hidden bg-white ${
                isDraggingPreview ? "cursor-grabbing" : "cursor-grab"
              }`}
              onPointerDown={handlePreviewPointerDown}
              onPointerMove={handlePreviewPointerMove}
              onPointerUp={handlePreviewPointerUp}
              onPointerCancel={handlePreviewPointerUp}>
              {selectedTheme ? (
                <div
                  ref={previewCanvasRef}
                  className="theme-preview-canvas min-w-[1180px] origin-top-left select-none"
                  style={{
                    transform: `translate3d(${previewPan.x}px, ${previewPan.y}px, 0) scale(${previewScale})`,
                    transformOrigin: "top left",
                  }}
                >
                  <ThemeStoreLivePreview theme={selectedTheme} />
                </div>
              ) : (
                <div className="grid h-[680px] place-items-center bg-white p-8 text-center">
                  <div>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.05em] text-[#241436]">
                      Choose a theme to preview it here.
                    </h3>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {visibleThemes.length === 0 ? (
        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Palette className="mx-auto text-slate-400" size={28} />
        </section>
      ) : null}
    </div>
  );
}

