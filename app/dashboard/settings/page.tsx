"use client";

import { useEffect, useState } from "react";
import {
  Bell,
  Building2,
  Loader2,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState("");
  const [supportEmail, setSupportEmail] = useState("");
  const [supportPhone, setSupportPhone] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setIsLoading(true);
      setMessage("");

      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (!user) {
          throw new Error("No logged-in user found.");
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          throw error;
        }

        if (!mounted) return;

        setProfile({
          id: user.id,
          email: user.email,
          ...data,
        });

        setFullName(data?.full_name || user.user_metadata?.full_name || "");
        setSupportEmail(user.email || "");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load settings.";

        setMessage(errorMessage);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSave() {
    if (!profile?.id) return;

    setIsSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id);

      if (error) {
        throw error;
      }

      setMessage("Settings saved successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to save settings.";

      setMessage(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[50vh] place-items-center">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={26} />
          <p className="mt-4 text-sm text-slate-500">Loading settings...</p>
        </div>
      </main>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          Settings
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
          Account settings
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Manage your profile, support contact details, and basic account
          preferences.
        </p>
      </section>

      {message ? (
        <div
          className={`border p-4 text-sm ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center bg-slate-950 text-white">
              <User size={18} />
            </span>

            <div>
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                Profile
              </h3>
              <p className="text-sm text-slate-500">
                Your personal account details.
              </p>
            </div>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Full name
              </span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-12 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-orange)]"
                placeholder="Your full name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Email address
              </span>
              <div className="flex h-12 items-center gap-3 border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                <Mail size={16} />
                {profile?.email || "No email"}
              </div>
            </label>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        <aside className="grid gap-5">
          <div className="border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-slate-950 text-white">
                <Building2 size={18} />
              </span>

              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                  Business support
                </h3>
                <p className="text-sm text-slate-500">
                  These can later be used for support replies and alerts.
                </p>
              </div>
            </div>

            <div className="grid gap-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Support email
                </span>
                <input
                  value={supportEmail}
                  onChange={(event) => setSupportEmail(event.target.value)}
                  className="h-12 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-orange)]"
                  placeholder="support@example.com"
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Support phone
                </span>
                <input
                  value={supportPhone}
                  onChange={(event) => setSupportPhone(event.target.value)}
                  className="h-12 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-orange)]"
                  placeholder="+234..."
                />
              </label>
            </div>
          </div>

          <div className="border border-slate-200 bg-slate-950 p-5 text-white shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center bg-white text-slate-950">
                <ShieldCheck size={18} />
              </span>

              <div>
                <h3 className="text-lg font-semibold tracking-[-0.03em]">
                  Security
                </h3>
                <p className="text-sm text-white/55">
                  Password and login security options can be added here later.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 border border-white/10 bg-white/5 p-4">
              <Bell size={17} className="text-white/60" />
              <p className="text-sm leading-6 text-white/65">
                Renewal reminders and account alerts will connect here after
                Paystack is finalized.
              </p>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}