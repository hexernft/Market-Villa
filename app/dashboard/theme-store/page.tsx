"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Loader2,
  Lock,
  Palette,
  Pencil,
  ShieldCheck,
} from "lucide-react";
import { getMyBusinesses } from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";
import { businessThemes, type BusinessTheme } from "@/lib/themes";
import {
  BusinessThemeExtension,
  getPurchasedThemeExtensions,
} from "@/lib/theme-editor-actions";
import {
  getThemeAccessDecision,
  getThemeAccessSummary,
} from "@/lib/theme-access";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  theme_id: string;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  subscription_grace_until?: string | null;
  admin_override_active?: boolean | null;
};

const visibleThemeIds = new Set([
  "default-one-page",
  "suya-spot-pro",
  "premium-treats",
]);

const themeOptions = businessThemes.filter((theme) => visibleThemeIds.has(theme.id));

async function activateTheme({
  businessId,
  themeId,
}: {
  businessId: string;
  themeId: string;
}) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const token = session?.access_token;

  if (!token) {
    throw new Error("You must be logged in to activate a theme.");
  }

  const response = await fetch("/api/themes/activate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ businessId, themeId }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.error || "Unable to activate theme.");
  }

  return payload;
}

export default function ThemeStorePage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingThemeId, setSavingThemeId] = useState("");
  const [message, setMessage] = useState("");
  const [extensions, setExtensions] = useState<BusinessThemeExtension[]>([]);

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
          setExtensions(await getPurchasedThemeExtensions(items[0].id));
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

  async function handleBusinessChange(businessId: string) {
    const business = businesses.find((item) => item.id === businessId);

    setSelectedBusinessId(businessId);
    setMessage("");

    if (!business) {
      setExtensions([]);
      return;
    }

    try {
      setExtensions(await getPurchasedThemeExtensions(businessId));
    } catch {
      setExtensions([]);
    }
  }

  async function handleActivateTheme(theme: BusinessTheme) {
    if (!selectedBusinessId) {
      setMessage("Create a business page first before choosing a theme.");
      return;
    }

    const decision = getThemeAccessDecision({
      theme,
      business: selectedBusiness,
      extensions,
    });

    if (!decision.allowed) {
      setMessage(decision.reason || "You do not have access to this theme.");
      return;
    }

    setSavingThemeId(theme.id);
    setMessage("");

    try {
      await activateTheme({
        businessId: selectedBusinessId,
        themeId: theme.id,
      });

      const updatedBusinesses = await getMyBusinesses();
      setBusinesses(updatedBusinesses);
      setMessage("Theme applied successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to apply theme.";

      setMessage(errorMessage);
    } finally {
      setSavingThemeId("");
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
      <section className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
            Theme Store
          </p>
          <h1 className="text-[1.8rem] font-black tracking-[-0.05em] text-[#171421]">
            Themes
          </h1>
        </div>

        <Link
          href="/dashboard/theme-editor"
          className="inline-flex rounded-2xl border border-[#ebe7f3] bg-white px-4 py-2 text-sm font-black text-[#241436]"
        >
          Theme Editor
        </Link>
      </section>

      <section className="rounded-2xl border border-[#ebe7f3] bg-white p-4">
        <label className="grid gap-2">
          <span className="text-sm font-bold text-slate-700">
            Apply to business
          </span>
          <select
            value={selectedBusinessId}
            onChange={(event) => handleBusinessChange(event.target.value)}
            className="min-h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm font-semibold text-[#241436] outline-none focus:border-[#7c3aed]"
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
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-3 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-3">
        {themeOptions.map((theme) => {
          const isActive = selectedBusiness?.theme_id === theme.id;
          const decision = getThemeAccessDecision({
            theme,
            business: selectedBusiness,
            extensions,
          });
          const isSaving = savingThemeId === theme.id;
          const canActivate = decision.allowed && !isActive;

          return (
            <article
              key={theme.id}
              className={`rounded-3xl border bg-white p-5 ${
                isActive ? "border-[#7c3aed]" : "border-[#ebe7f3]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
                  <Palette size={22} />
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-black ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700"
                      : decision.allowed
                        ? "bg-[#f1eaff] text-[#241436]"
                        : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {isActive ? "Active theme" : decision.label}
                </span>
              </div>

              <h2 className="mt-5 text-lg font-black tracking-[-0.04em] text-[#171421]">
                {theme.name}
              </h2>
              <p className="mt-2 min-h-12 text-sm font-semibold leading-6 text-slate-600">
                {theme.bestFor || theme.description || getThemeAccessSummary(theme)}
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-600">
                  <ShieldCheck size={13} />
                  {getThemeAccessSummary(theme)}
                </span>
                {decision.source === "purchase" ? (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                    Purchased
                  </span>
                ) : null}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {isActive ? (
                  <Link
                    href={`/dashboard/theme-editor/${theme.id}?businessId=${selectedBusinessId}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#241436] px-4 text-sm font-black text-white"
                  >
                    <Pencil size={15} />
                    Edit Theme
                  </Link>
                ) : canActivate ? (
                  <button
                    type="button"
                    onClick={() => handleActivateTheme(theme)}
                    disabled={isSaving}
                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#241436] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSaving ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={15} />
                    )}
                    {isSaving ? "Activating..." : "Activate"}
                  </button>
                ) : (
                  <Link
                    href="/dashboard/billing"
                    className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#7c3aed] px-4 text-sm font-black text-white"
                    onClick={() => setMessage(decision.reason || "")}
                  >
                    <Lock size={15} />
                    {decision.actionLabel}
                  </Link>
                )}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
