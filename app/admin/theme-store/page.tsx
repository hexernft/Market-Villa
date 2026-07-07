"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { businessThemes } from "@/lib/themes";
import { getThemeAccessSummary } from "@/lib/theme-access";

type BusinessRow = {
  id: string;
  name: string;
  slug: string;
  theme_id?: string | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
};

type ThemeExtensionRow = {
  id: string;
  business_id: string;
  theme_id: string;
  status: string;
};

const managedThemeIds = new Set([
  "default-one-page",
  "suya-spot-pro",
  "premium-treats",
]);

const managedThemes = businessThemes.filter((theme) => managedThemeIds.has(theme.id));

export default function AdminThemeStorePage() {
  const [businesses, setBusinesses] = useState<BusinessRow[]>([]);
  const [extensions, setExtensions] = useState<ThemeExtensionRow[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(
    () => businesses.find((business) => business.id === selectedBusinessId),
    [businesses, selectedBusinessId],
  );

  async function loadData() {
    setIsLoading(true);
    setMessage("");

    try {
      const [{ data: businessRows, error: businessError }, { data: extensionRows, error: extensionError }] =
        await Promise.all([
          supabase
            .from("businesses")
            .select("id,name,slug,theme_id,subscription_plan,subscription_status")
            .order("created_at", { ascending: false }),
          supabase
            .from("business_theme_extensions")
            .select("id,business_id,theme_id,status"),
        ]);

      if (businessError) throw businessError;
      if (extensionError) throw extensionError;

      setBusinesses((businessRows || []) as BusinessRow[]);
      setExtensions((extensionRows || []) as ThemeExtensionRow[]);

      if ((businessRows || []).length && !selectedBusinessId) {
        setSelectedBusinessId(String(businessRows?.[0]?.id || ""));
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load theme access.";
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hasManualAccess(themeId: string) {
    return extensions.some(
      (extension) =>
        extension.business_id === selectedBusinessId &&
        extension.theme_id === themeId &&
        extension.status === "active",
    );
  }

  async function grantAccess(themeId: string) {
    if (!selectedBusinessId) return;

    setSavingKey(`${selectedBusinessId}:${themeId}`);
    setMessage("");

    try {
      const { error } = await supabase.from("business_theme_extensions").upsert(
        {
          business_id: selectedBusinessId,
          theme_id: themeId,
          status: "active",
          updated_at: new Date().toISOString(),
        },
        { onConflict: "business_id,theme_id" },
      );

      if (error) throw error;

      await loadData();
      setMessage("Theme access granted.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to grant access.";
      setMessage(errorMessage);
    } finally {
      setSavingKey("");
    }
  }

  async function revokeAccess(themeId: string) {
    if (!selectedBusinessId) return;

    setSavingKey(`${selectedBusinessId}:${themeId}`);
    setMessage("");

    try {
      const { error } = await supabase
        .from("business_theme_extensions")
        .update({
          status: "revoked",
          updated_at: new Date().toISOString(),
        })
        .eq("business_id", selectedBusinessId)
        .eq("theme_id", themeId);

      if (error) throw error;

      await loadData();
      setMessage("Theme access revoked.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to revoke access.";
      setMessage(errorMessage);
    } finally {
      setSavingKey("");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5ff] p-6">
      <div className="mx-auto grid max-w-6xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 text-sm font-black text-[#241436]"
            >
              <ArrowLeft size={16} />
              Back to Admin
            </Link>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Admin Theme Store
            </p>
            <h1 className="text-3xl font-black tracking-[-0.05em] text-[#171421]">
              Theme access controls
            </h1>
          </div>
        </header>

        {message ? (
          <div className="rounded-2xl border border-[#ebe7f3] bg-white p-3 text-sm font-semibold text-slate-700">
            {message}
          </div>
        ) : null}

        <section className="rounded-3xl border border-[#ebe7f3] bg-white p-5">
          {isLoading ? (
            <div className="grid min-h-48 place-items-center">
              <Loader2 className="animate-spin text-[#241436]" />
            </div>
          ) : (
            <div className="grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-bold text-slate-700">
                  Business
                </span>
                <select
                  value={selectedBusinessId}
                  onChange={(event) => setSelectedBusinessId(event.target.value)}
                  className="min-h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm font-semibold text-[#241436] outline-none focus:border-[#7c3aed]"
                >
                  {businesses.map((business) => (
                    <option key={business.id} value={business.id}>
                      {business.name} - {business.subscription_plan || "starter"} -{" "}
                      {business.subscription_status || "trial"}
                    </option>
                  ))}
                </select>
              </label>

              <div className="grid gap-4 lg:grid-cols-3">
                {managedThemes.map((theme) => {
                  const accessGranted = hasManualAccess(theme.id);
                  const isActive = selectedBusiness?.theme_id === theme.id;
                  const isSaving = savingKey === `${selectedBusinessId}:${theme.id}`;

                  return (
                    <article
                      key={theme.id}
                      className="rounded-3xl border border-[#ebe7f3] bg-[#fbf9ff] p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white text-[#7c3aed]">
                          <ShieldCheck size={22} />
                        </span>
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#241436]">
                          {getThemeAccessSummary(theme)}
                        </span>
                      </div>

                      <h2 className="mt-5 text-lg font-black tracking-[-0.04em] text-[#171421]">
                        {theme.name}
                      </h2>
                      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                        {theme.bestFor || theme.description || "Storefront theme"}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                            <CheckCircle2 size={13} />
                            Active
                          </span>
                        ) : null}
                        {accessGranted ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#f1eaff] px-3 py-1 text-xs font-black text-[#241436]">
                            <CheckCircle2 size={13} />
                            Manual access
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
                            <Lock size={13} />
                            No manual access
                          </span>
                        )}
                      </div>

                      <div className="mt-5 flex gap-2">
                        {accessGranted ? (
                          <button
                            type="button"
                            onClick={() => revokeAccess(theme.id)}
                            disabled={isSaving}
                            className="inline-flex min-h-10 items-center gap-2 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm font-black text-[#241436] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : null}
                            Revoke
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => grantAccess(theme.id)}
                            disabled={isSaving}
                            className="inline-flex min-h-10 items-center gap-2 rounded-2xl bg-[#241436] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {isSaving ? (
                              <Loader2 size={15} className="animate-spin" />
                            ) : null}
                            Grant access
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
