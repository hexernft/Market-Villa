"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronRight,
  CreditCard,
  Globe2,
  HelpCircle,
  LayoutDashboard,
  Loader2,
  Mail,
  Megaphone,
  Package,
  Palette,
  Save,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Profile = {
  id: string;
  full_name?: string | null;
  email?: string | null;
  role?: string | null;
};

const menuSections = [
  {
    title: "Store Setup",
    items: [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
      { label: "Profile", href: "/dashboard/profile", icon: User },
      { label: "Theme", href: "/dashboard/theme", icon: Palette },
      { label: "Theme Store", href: "/dashboard/theme-store", icon: Sparkles },
      { label: "Domain", href: "/dashboard/domain", icon: Globe2 },
      { label: "Visibility", href: "/dashboard/visibility", icon: Megaphone },
      { label: "Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
    ],
  },
  {
    title: "Selling",
    items: [
      { label: "Products", href: "/dashboard/products", icon: Package },
      { label: "Orders", href: "/dashboard/orders", icon: ShoppingBag },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
      { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    ],
  },
  {
    title: "Support",
    items: [
      { label: "Help Center", href: "/help", icon: HelpCircle },
      { label: "Platform Status", href: "/status", icon: ShieldCheck },
    ],
  },
];

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
      <section className="border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
          More
        </p>

        <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
          Dashboard menu
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Everything from the desktop sidebar is available here on mobile.
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

      <section className="grid gap-3 xl:grid-cols-3">
        {menuSections.map((section) => (
          <div
            key={section.title}
            className="border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              {section.title}
            </p>

            <div className="mt-3 grid gap-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:bg-white"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="grid h-8 w-8 place-items-center rounded-2xl bg-white text-emerald-700">
                        <Icon size={18} />
                      </span>
                      {item.label}
                    </span>

                    <ChevronRight size={17} className="text-slate-400" />
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <div className="border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <User size={18} />
            </span>

            <div>
              <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
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
                className="h-10 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-violet)]"
                placeholder="Your full name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Email address
              </span>
              <div className="flex h-10 items-center gap-3 border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500">
                <Mail size={16} />
                {profile?.email || "No email"}
              </div>
            </label>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <Building2 size={18} />
              </span>

              <div>
                <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
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
                  className="h-10 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-violet)]"
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
                  className="h-10 border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[var(--mv-violet)]"
                  placeholder="+234..."
                />
              </label>
            </div>
          </div>

          <div className="border border-slate-200 bg-white p-4 text-slate-950 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={18} />
              </span>

              <div>
                <h3 className="text-sm font-semibold tracking-[-0.03em]">
                  Security
                </h3>
                <p className="text-sm text-slate-500">
                  Password and login security options can be added here later.
                </p>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <Bell size={17} className="text-slate-500" />
              <p className="text-sm leading-6 text-slate-500">
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

