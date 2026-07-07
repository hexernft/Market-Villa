"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  CreditCard,
  Globe2,
  LayoutDashboard,
  Loader2,
  Palette,
  Search,
  Settings,
  ShieldCheck,
  UsersRound,
} from "lucide-react";
import {
  getAllBusinessesForAdmin,
  getAllDomainRequestsForAdmin,
  getAdminPlatformMetrics,
  updateBusinessAdminOverride,
  updateBusinessPublishStatus,
  updateDomainRequestStatus,
} from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";
import { businessThemes } from "@/lib/themes";
import { getThemeAccessSummary } from "@/lib/theme-access";

type AdminView =
  | "overview"
  | "businesses"
  | "subscriptions"
  | "payments"
  | "domains"
  | "themes"
  | "users"
  | "settings";

type AdminBusiness = {
  id: string;
  owner_id?: string | null;
  name: string;
  slug: string;
  theme_id?: string | null;
  is_published?: boolean | null;
  subscription_plan?: string | null;
  subscription_status?: string | null;
  subscription_expires_at?: string | null;
  subscription_grace_until?: string | null;
  grace_period_ends_at?: string | null;
  admin_override_active?: boolean | null;
  created_at?: string | null;
};

type DomainRequest = {
  id: string;
  business_id: string;
  requested_domain: string;
  status: string;
  admin_note?: string | null;
  created_at?: string | null;
  businesses?: {
    name?: string | null;
    slug?: string | null;
    owner_id?: string | null;
  } | null;
};

type Payment = {
  id: string;
  business_id?: string | null;
  owner_id?: string | null;
  plan?: string | null;
  amount?: number | null;
  currency?: string | null;
  reference?: string | null;
  status?: string | null;
  paid_at?: string | null;
  created_at?: string | null;
};

type Profile = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  created_at?: string | null;
};

type PlatformMetrics = {
  vehicleInquiries: number;
  propertyInquiries: number;
  successfulPayments: number;
  activeSubscriptionPrices: number;
};

const domainStatuses = ["pending", "approved", "rejected", "completed"];

const navItems: Array<{
  view: AdminView;
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
}> = [
  { view: "overview", label: "Overview", href: "/admin", icon: LayoutDashboard },
  { view: "businesses", label: "Businesses", href: "/admin/businesses", icon: Building2 },
  { view: "subscriptions", label: "Subscriptions", href: "/admin/subscriptions", icon: CreditCard },
  { view: "payments", label: "Payments", href: "/admin/payments", icon: CreditCard },
  { view: "themes", label: "Themes", href: "/admin/themes", icon: Palette },
  { view: "domains", label: "Domain Requests", href: "/admin/domain-requests", icon: Globe2 },
  { view: "users", label: "Users", href: "/admin/users", icon: UsersRound },
  { view: "settings", label: "Settings", href: "/admin/settings", icon: Settings },
];

function titleCase(value?: string | null) {
  return String(value || "unknown")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatNaira(value?: number | null) {
  return `₦${Number(value || 0).toLocaleString()}`;
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getTime();
}

function statusTone(status?: string | null) {
  const value = String(status || "").toLowerCase();
  if (["active", "published", "success", "approved", "completed", "trial"].includes(value)) {
    return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
  if (["expired", "payment_failed", "rejected", "revoked"].includes(value)) {
    return "bg-red-50 text-red-700 border-red-100";
  }
  if (["grace_period", "pending", "draft"].includes(value)) {
    return "bg-amber-50 text-amber-700 border-amber-100";
  }
  return "bg-slate-50 text-slate-600 border-slate-100";
}

function Badge({ children, tone }: { children: ReactNode; tone?: string }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${tone || "border-slate-100 bg-slate-50 text-slate-600"}`}>
      {children}
    </span>
  );
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#e8e1f2] bg-white p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[#171421]">
        {value}
      </p>
      {detail ? <p className="mt-1 text-xs font-semibold text-slate-500">{detail}</p> : null}
    </div>
  );
}

export function AdminControlPage({ view }: { view: AdminView }) {
  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [domains, setDomains] = useState<DomainRequest[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    vehicleInquiries: 0,
    propertyInquiries: 0,
    successfulPayments: 0,
    activeSubscriptionPrices: 0,
  });
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [updatingId, setUpdatingId] = useState("");
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function loadData() {
    setIsLoading(true);
    setMessage("");

    try {
      const [businessRows, domainRows, platformMetrics, paymentsResult, profilesResult] =
        await Promise.all([
          getAllBusinessesForAdmin(),
          getAllDomainRequestsForAdmin(),
          getAdminPlatformMetrics(),
          supabase
            .from("payments")
            .select("id,business_id,owner_id,plan,amount,currency,reference,status,paid_at,created_at")
            .order("created_at", { ascending: false }),
          supabase
            .from("profiles")
            .select("id,email,full_name,role,created_at")
            .order("created_at", { ascending: false }),
        ]);

      if (paymentsResult.error) throw paymentsResult.error;
      if (profilesResult.error) throw profilesResult.error;

      setBusinesses((businessRows || []) as AdminBusiness[]);
      setDomains((domainRows || []) as DomainRequest[]);
      setMetrics(platformMetrics);
      setPayments((paymentsResult.data || []) as Payment[]);
      setProfiles((profilesResult.data || []) as Profile[]);
      setIsAuthorized(true);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Unable to load admin control center.",
      );
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const ownerById = useMemo(() => {
    return new Map(profiles.map((profile) => [profile.id, profile]));
  }, [profiles]);

  const businessById = useMemo(() => {
    return new Map(businesses.map((business) => [business.id, business]));
  }, [businesses]);

  const filteredBusinesses = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return businesses;
    return businesses.filter((business) => {
      const owner = ownerById.get(String(business.owner_id || ""));
      return [
        business.name,
        business.slug,
        business.subscription_plan,
        business.subscription_status,
        owner?.email,
        owner?.full_name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(search);
    });
  }, [businesses, ownerById, query]);

  const monthRevenue = useMemo(() => {
    const monthStart = getMonthStart();
    return payments
      .filter((payment) => {
        const paidTime = new Date(payment.paid_at || payment.created_at || 0).getTime();
        return payment.status === "success" && paidTime >= monthStart;
      })
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  }, [payments]);

  const activeSubscriptions = businesses.filter((business) =>
    ["trial", "active"].includes(String(business.subscription_status || "")),
  ).length;
  const graceOrExpired = businesses.filter((business) =>
    ["grace_period", "expired", "payment_failed"].includes(
      String(business.subscription_status || ""),
    ),
  ).length;
  const publishedCount = businesses.filter((business) => business.is_published).length;
  const pendingDomains = domains.filter((domain) => domain.status === "pending").length;

  async function togglePublish(business: AdminBusiness) {
    setUpdatingId(business.id);
    setMessage("");
    try {
      await updateBusinessPublishStatus({
        businessId: business.id,
        isPublished: !business.is_published,
      });
      await loadData();
      setMessage(business.is_published ? "Business unpublished." : "Business published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update business.");
    } finally {
      setUpdatingId("");
    }
  }

  async function toggleOverride(business: AdminBusiness) {
    setUpdatingId(`override-${business.id}`);
    setMessage("");
    try {
      await updateBusinessAdminOverride({
        businessId: business.id,
        isActive: !business.admin_override_active,
      });
      await loadData();
      setMessage(
        business.admin_override_active
          ? "Admin override disabled."
          : "Admin override enabled.",
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update override.");
    } finally {
      setUpdatingId("");
    }
  }

  async function updateDomain(domain: DomainRequest, status: string) {
    setUpdatingId(`${domain.id}:${status}`);
    setMessage("");
    try {
      await updateDomainRequestStatus({
        requestId: domain.id,
        status,
        adminNote: notes[domain.id] || domain.admin_note || "",
      });
      await loadData();
      setMessage("Domain request updated.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to update domain request.");
    } finally {
      setUpdatingId("");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5ff]">
        <Loader2 className="animate-spin text-[#241436]" size={28} />
      </main>
    );
  }

  if (!isAuthorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f8f5ff] px-5">
        <section className="w-full max-w-md rounded-3xl border border-[#e8e1f2] bg-white p-6 text-center">
          <ShieldCheck className="mx-auto text-red-600" size={28} />
          <h1 className="mt-3 text-xl font-black text-[#171421]">
            Admin access required
          </h1>
          {message ? <p className="mt-3 text-sm font-semibold text-red-700">{message}</p> : null}
          <Link
            href="/admin-login"
            className="mt-5 inline-flex rounded-full bg-[#241436] px-5 py-2.5 text-sm font-black text-white"
          >
            Login as Admin
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f5ff]">
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 border-r border-white/15 bg-[#241436] p-4 text-white lg:block">
        <Link href="/admin" className="mb-7 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white text-[#241436]">
            <ShieldCheck size={19} />
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.22em] text-white/45">
              Market Villa
            </span>
            <span className="block text-sm font-black">Admin Center</span>
          </span>
        </Link>
        <nav className="grid gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.view}
                href={item.href}
                className={`flex min-h-10 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition ${
                  item.view === view
                    ? "bg-white text-[#241436]"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/admin/theme-store"
            className="flex min-h-10 items-center gap-3 rounded-2xl px-3 text-sm font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            <Palette size={16} />
            Theme Store
          </Link>
        </nav>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-[#e8e1f2] bg-white/90 backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
            <div>
              <Link href="/" className="inline-flex items-center gap-2 text-xs font-black text-[#7c3aed]">
                <ArrowLeft size={14} />
                Website
              </Link>
              <h1 className="text-xl font-black tracking-[-0.04em] text-[#171421]">
                {navItems.find((item) => item.view === view)?.label || "Admin"}
              </h1>
            </div>
            <Link
              href="/admin/pricing"
              className="rounded-full bg-[#241436] px-4 py-2 text-sm font-black text-white"
            >
              Pricing
            </Link>
          </div>
        </header>

        <div className="grid gap-5 p-4 lg:p-6">
          {message ? (
            <div className="rounded-2xl border border-[#e8e1f2] bg-white p-3 text-sm font-semibold text-slate-700">
              {message}
            </div>
          ) : null}

          {view === "overview" ? (
            <>
              <section className="rounded-3xl border border-[#e8e1f2] bg-[#241436] p-6 text-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#c4a6ff]">
                  Platform Overview
                </p>
                <h2 className="mt-2 max-w-2xl text-2xl font-black tracking-[-0.05em]">
                  Manage businesses, subscriptions, payments, themes, and requests.
                </h2>
              </section>
              <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <MetricCard label="Total businesses" value={businesses.length} />
                <MetricCard label="Published" value={publishedCount} />
                <MetricCard label="Unpublished" value={businesses.length - publishedCount} />
                <MetricCard label="Active subscriptions" value={activeSubscriptions} />
                <MetricCard label="Expired / grace" value={graceOrExpired} />
                <MetricCard label="Revenue this month" value={formatNaira(monthRevenue)} />
                <MetricCard label="Pending domains" value={pendingDomains} />
                <MetricCard label="Successful payments" value={metrics.successfulPayments} />
              </section>
              <RecentBusinesses businesses={businesses.slice(0, 8)} ownerById={ownerById} />
            </>
          ) : null}

          {view === "businesses" ? (
            <BusinessesView
              query={query}
              setQuery={setQuery}
              businesses={filteredBusinesses}
              ownerById={ownerById}
              updatingId={updatingId}
              togglePublish={togglePublish}
              toggleOverride={toggleOverride}
            />
          ) : null}

          {view === "subscriptions" ? (
            <SubscriptionsView businesses={businesses} payments={payments} />
          ) : null}

          {view === "payments" ? (
            <PaymentsView payments={payments} businessById={businessById} ownerById={ownerById} />
          ) : null}

          {view === "domains" ? (
            <DomainsView
              domains={domains}
              notes={notes}
              setNotes={setNotes}
              updatingId={updatingId}
              updateDomain={updateDomain}
            />
          ) : null}

          {view === "themes" ? (
            <ThemesView businesses={businesses} />
          ) : null}

          {view === "users" ? (
            <UsersView profiles={profiles} businesses={businesses} />
          ) : null}

          {view === "settings" ? (
            <section className="rounded-3xl border border-[#e8e1f2] bg-white p-6">
              <h2 className="text-lg font-black text-[#171421]">Admin Settings</h2>
              <p className="mt-2 text-sm font-semibold text-slate-500">
                Platform settings will live here as configuration grows.
              </p>
            </section>
          ) : null}
        </div>
      </section>
    </main>
  );
}

function RecentBusinesses({
  businesses,
  ownerById,
}: {
  businesses: AdminBusiness[];
  ownerById: Map<string, Profile>;
}) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#171421]">Recent businesses</h2>
        <Link href="/admin/businesses" className="text-sm font-black text-[#7c3aed]">
          View all
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="py-3">Business</th>
              <th>Owner</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((business) => (
              <tr key={business.id}>
                <td className="py-3 font-black text-[#171421]">{business.name}</td>
                <td>{ownerById.get(String(business.owner_id || ""))?.email || "Unknown"}</td>
                <td>
                  <Badge tone={statusTone(business.is_published ? "published" : "draft")}>
                    {business.is_published ? "Published" : "Unpublished"}
                  </Badge>
                </td>
                <td>{titleCase(business.subscription_plan)}</td>
                <td>{formatDate(business.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function BusinessesView({
  query,
  setQuery,
  businesses,
  ownerById,
  updatingId,
  togglePublish,
  toggleOverride,
}: {
  query: string;
  setQuery: (value: string) => void;
  businesses: AdminBusiness[];
  ownerById: Map<string, Profile>;
  updatingId: string;
  togglePublish: (business: AdminBusiness) => void;
  toggleOverride: (business: AdminBusiness) => void;
}) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#171421]">Businesses</h2>
        <label className="relative block w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-2xl border border-[#e8e1f2] bg-white pl-10 pr-4 text-sm font-semibold outline-none focus:border-[#7c3aed]"
            placeholder="Search businesses"
          />
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1050px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="py-3">Business</th>
              <th>Owner</th>
              <th>Store URL</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Subscription</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((business) => {
              const owner = ownerById.get(String(business.owner_id || ""));
              return (
                <tr key={business.id}>
                  <td className="py-3 font-black text-[#171421]">{business.name}</td>
                  <td>{owner?.email || owner?.full_name || "Unknown"}</td>
                  <td className="font-semibold text-slate-500">/store/{business.slug}</td>
                  <td>
                    <Badge tone={statusTone(business.is_published ? "published" : "draft")}>
                      {business.is_published ? "Published" : "Unpublished"}
                    </Badge>
                  </td>
                  <td>{titleCase(business.subscription_plan)}</td>
                  <td>
                    <Badge tone={statusTone(business.subscription_status)}>
                      {titleCase(business.subscription_status)}
                    </Badge>
                  </td>
                  <td>{formatDate(business.created_at)}</td>
                  <td>
                    <div className="flex flex-wrap gap-2">
                      <Link href={`/admin#business-${business.id}`} className="rounded-full border border-[#e8e1f2] px-3 py-1.5 text-xs font-black text-[#241436]">
                        View
                      </Link>
                      <Link href={`/store/${business.slug}`} className="rounded-full bg-[#241436] px-3 py-1.5 text-xs font-black text-white">
                        Storefront
                      </Link>
                      <button
                        type="button"
                        onClick={() => togglePublish(business)}
                        disabled={updatingId === business.id}
                        className="rounded-full border border-[#e8e1f2] px-3 py-1.5 text-xs font-black text-[#241436] disabled:opacity-60"
                      >
                        {business.is_published ? "Unpublish" : "Publish"}
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleOverride(business)}
                        disabled={updatingId === `override-${business.id}`}
                        className="rounded-full border border-[#e8e1f2] px-3 py-1.5 text-xs font-black text-[#7c3aed] disabled:opacity-60"
                      >
                        {business.admin_override_active ? "Revoke override" : "Admin override"}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function SubscriptionsView({
  businesses,
  payments,
}: {
  businesses: AdminBusiness[];
  payments: Payment[];
}) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <h2 className="mb-4 text-lg font-black text-[#171421]">Subscriptions</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="py-3">Business</th>
              <th>Plan</th>
              <th>Status</th>
              <th>Renewal</th>
              <th>Grace</th>
              <th>Override</th>
              <th>Last payment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {businesses.map((business) => {
              const lastPayment = payments.find((payment) => payment.business_id === business.id);
              return (
                <tr key={business.id}>
                  <td className="py-3 font-black text-[#171421]">{business.name}</td>
                  <td>{titleCase(business.subscription_plan)}</td>
                  <td>
                    <Badge tone={statusTone(business.subscription_status)}>
                      {titleCase(business.subscription_status)}
                    </Badge>
                  </td>
                  <td>{formatDate(business.subscription_expires_at)}</td>
                  <td>{formatDate(business.subscription_grace_until || business.grace_period_ends_at)}</td>
                  <td>{business.admin_override_active ? "Enabled" : "Off"}</td>
                  <td>{lastPayment ? `${formatNaira(lastPayment.amount)} · ${titleCase(lastPayment.status)}` : "None"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PaymentsView({
  payments,
  businessById,
  ownerById,
}: {
  payments: Payment[];
  businessById: Map<string, AdminBusiness>;
  ownerById: Map<string, Profile>;
}) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <h2 className="mb-4 text-lg font-black text-[#171421]">Payments</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="py-3">Business</th>
              <th>Owner</th>
              <th>Plan</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Reference</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {payments.map((payment) => {
              const business = businessById.get(String(payment.business_id || ""));
              const owner = ownerById.get(String(payment.owner_id || business?.owner_id || ""));
              return (
                <tr key={payment.id}>
                  <td className="py-3 font-black text-[#171421]">{business?.name || "Unknown"}</td>
                  <td>{owner?.email || "Unknown"}</td>
                  <td>{titleCase(payment.plan)}</td>
                  <td>{formatNaira(payment.amount)}</td>
                  <td>
                    <Badge tone={statusTone(payment.status)}>{titleCase(payment.status)}</Badge>
                  </td>
                  <td className="max-w-52 truncate font-mono text-xs">{payment.reference || "No reference"}</td>
                  <td>{formatDate(payment.paid_at || payment.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DomainsView({
  domains,
  notes,
  setNotes,
  updatingId,
  updateDomain,
}: {
  domains: DomainRequest[];
  notes: Record<string, string>;
  setNotes: Dispatch<SetStateAction<Record<string, string>>>;
  updatingId: string;
  updateDomain: (domain: DomainRequest, status: string) => void;
}) {
  return (
    <section className="grid gap-4">
      {domains.length === 0 ? (
        <div className="rounded-3xl border border-[#e8e1f2] bg-white p-6 text-sm font-semibold text-slate-500">
          No domain requests yet.
        </div>
      ) : null}
      {domains.map((domain) => (
        <article key={domain.id} className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div>
              <Badge tone={statusTone(domain.status)}>{titleCase(domain.status)}</Badge>
              <h2 className="mt-3 text-lg font-black text-[#171421]">{domain.requested_domain}</h2>
              <p className="mt-1 text-sm font-semibold text-slate-500">
                {domain.businesses?.name || "Unknown business"} · {formatDate(domain.created_at)}
              </p>
              {domain.admin_note ? (
                <p className="mt-3 rounded-2xl bg-[#f8f5ff] p-3 text-sm font-semibold text-slate-600">
                  {domain.admin_note}
                </p>
              ) : null}
            </div>
            <div className="grid gap-3">
              <textarea
                value={notes[domain.id] ?? domain.admin_note ?? ""}
                onChange={(event) =>
                  setNotes((current) => ({ ...current, [domain.id]: event.target.value }))
                }
                className="min-h-20 rounded-2xl border border-[#e8e1f2] p-3 text-sm font-semibold outline-none focus:border-[#7c3aed]"
                placeholder="Admin notes"
              />
              <div className="flex flex-wrap gap-2">
                {domainStatuses.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => updateDomain(domain, status)}
                    disabled={updatingId === `${domain.id}:${status}`}
                    className="rounded-full border border-[#e8e1f2] px-3 py-1.5 text-xs font-black text-[#241436] disabled:opacity-60"
                  >
                    {updatingId === `${domain.id}:${status}` ? "Saving..." : titleCase(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}

function ThemesView({ businesses }: { businesses: AdminBusiness[] }) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-black text-[#171421]">Themes</h2>
        <Link href="/admin/theme-store" className="rounded-full bg-[#241436] px-4 py-2 text-sm font-black text-white">
          Manage access
        </Link>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {businessThemes.slice(0, 12).map((theme) => {
          const usage = businesses.filter((business) => business.theme_id === theme.id).length;
          return (
            <article key={theme.id} className="rounded-3xl border border-[#e8e1f2] bg-[#fbf9ff] p-5">
              <div className="flex items-start justify-between gap-3">
                <Palette className="text-[#7c3aed]" size={22} />
                <Badge>{getThemeAccessSummary(theme)}</Badge>
              </div>
              <h3 className="mt-4 text-base font-black text-[#171421]">{theme.name}</h3>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-500">
                {theme.bestFor || theme.description || "Storefront theme"}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs font-black text-slate-500">{usage} businesses using it</span>
                <Link href="/theme-preview" className="inline-flex items-center gap-1 text-xs font-black text-[#7c3aed]">
                  Preview <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function UsersView({
  profiles,
  businesses,
}: {
  profiles: Profile[];
  businesses: AdminBusiness[];
}) {
  return (
    <section className="rounded-3xl border border-[#e8e1f2] bg-white p-5">
      <h2 className="mb-4 text-lg font-black text-[#171421]">Users</h2>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
            <tr>
              <th className="py-3">User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Businesses</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {profiles.map((profile) => (
              <tr key={profile.id}>
                <td className="py-3 font-black text-[#171421]">{profile.full_name || "No name"}</td>
                <td>{profile.email || "No email"}</td>
                <td>
                  <Badge tone={profile.role === "super_admin" ? "border-[#e8e1f2] bg-[#f1eaff] text-[#241436]" : undefined}>
                    {titleCase(profile.role)}
                  </Badge>
                </td>
                <td>{businesses.filter((business) => business.owner_id === profile.id).length}</td>
                <td>{formatDate(profile.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
