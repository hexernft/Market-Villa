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
  MessageCircle,
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
      { label: "Domain", href: "/dashboard/domain", icon: Globe2 },
      { label: "Visibility", href: "/dashboard/visibility", icon: Megaphone },
      { label: "Onboarding", href: "/dashboard/onboarding", icon: Sparkles },
    ],
  },
  {
    title: "Sales & Marketing",
    items: [
      { label: "Inventory", href: "/dashboard/products", icon: Package },
      { label: "Leads", href: "/dashboard/leads", icon: MessageCircle },
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
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={26} />
        </div>
      </main>
    );
  }

  return (
    <div className="grid gap-4">
      <section>
        <h1 className="text-[1.8rem] font-black tracking-[-0.05em] text-[#171421]">
          More
        </h1>
      </section>

      {message ? (
        <div
          className={`rounded-2xl border p-4 text-sm font-semibold ${
            message.toLowerCase().includes("success")
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-3">
        {menuSections.map((section) => (
          <div
            key={section.title}
            className="rounded-2xl border border-[#ebe7f3] bg-white p-3"
          >
            <p className="px-1 text-xs font-black uppercase tracking-[0.22em] text-[#171421]">
              {section.title}
            </p>

            <div className="mt-3 grid gap-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center justify-between rounded-2xl border border-transparent bg-white px-3 py-3 text-base font-semibold text-[#171421] transition hover:border-[#ebe7f3] hover:bg-[#fcfbff]"
                  >
                    <span className="inline-flex items-center gap-3">
                      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
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

      <section className="grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-4">
          <div className="mb-5 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
              <User size={18} />
            </span>

            <div>
              <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                Profile
              </h3>
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
                className="h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm outline-none focus:border-[#7c3aed]"
                placeholder="Your full name"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">
                Email address
              </span>
              <div className="flex h-11 items-center gap-3 rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 text-sm text-slate-500">
                <Mail size={16} />
                {profile?.email || "No email"}
              </div>
            </label>

            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-5 text-sm font-bold text-white hover:bg-[#351b55] disabled:cursor-not-allowed disabled:opacity-60"
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
          <div className="rounded-2xl border border-[#ebe7f3] bg-white p-4">
            <div className="mb-5 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
                <Building2 size={18} />
              </span>

              <div>
                <h3 className="text-sm font-semibold tracking-[-0.03em] text-slate-950">
                  Business support
                </h3>
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
                  className="h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm outline-none focus:border-[#7c3aed]"
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
                  className="h-11 rounded-2xl border border-[#ebe7f3] bg-white px-4 text-sm outline-none focus:border-[#7c3aed]"
                  placeholder="+234..."
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-[#ebe7f3] bg-white p-4 text-slate-950">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
                <ShieldCheck size={18} />
              </span>

              <div>
                <h3 className="text-sm font-semibold tracking-[-0.03em]">
                  Security
                </h3>
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] p-4">
              <Bell size={17} className="text-slate-500" />
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}



