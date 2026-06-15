"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock3,
  Globe2,
  LayoutDashboard,
  Loader2,
  Search,
  ShieldCheck,
  Store,
  Megaphone,
  Banknote,
  BadgeDollarSign,
} from "lucide-react";
import {
  getAllBusinessesForAdmin,
  getAllDomainRequestsForAdmin,
  updateBusinessPublishStatus,
  updateBusinessAdminOverride,
  updateBusinessSubscriptionControls,
  updateDomainRequestStatus,
} from "@/lib/business-actions";

type AdminBusiness = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  location: string | null;
  theme_id: string;
  is_published: boolean;
  custom_domain: string | null;
  custom_domain_status: string;
  subscription_plan: string;
  subscription_status: string;
  subscription_expires_at: string | null;
  grace_period_ends_at: string | null;
  admin_override_active: boolean | null;
  created_at: string;
};

type AdminDomainRequest = {
  id: string;
  business_id: string;
  requested_domain: string;
  alternative_domain: string | null;
  already_owned: boolean;
  contact_phone: string | null;
  note: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
  businesses: {
    name: string;
    slug: string;
    owner_id: string;
  } | null;
};

const statusOptions = [
  "pending",
  "checking",
  "awaiting_payment",
  "in_setup",
  "active",
  "rejected",
];

function formatDateTimeLocal(value: string | null) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function toIsoDateTime(value: FormDataEntryValue | null) {
  const cleanValue = String(value || "").trim();

  if (!cleanValue) return "";

  const date = new Date(cleanValue);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString();
}

export default function AdminPage() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const [businesses, setBusinesses] = useState<AdminBusiness[]>([]);
  const [domainRequests, setDomainRequests] = useState<AdminDomainRequest[]>(
    []
  );

  const [query, setQuery] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [updatingId, setUpdatingId] = useState("");
  const [updatingBusinessId, setUpdatingBusinessId] = useState("");
  const [updatingOverrideBusinessId, setUpdatingOverrideBusinessId] = useState("");
  const [updatingSubscriptionBusinessId, setUpdatingSubscriptionBusinessId] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadAdminData() {
    try {
      setIsLoading(true);

      const [businessItems, requestItems] = await Promise.all([
        getAllBusinessesForAdmin(),
        getAllDomainRequestsForAdmin(),
      ]);

      setBusinesses(businessItems);
      setDomainRequests(requestItems);
      setIsAuthorized(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load admin data.";

      setMessage(errorMessage);
      setIsAuthorized(false);
    } finally {
      setIsLoading(false);
      setAuthChecked(true);
    }
  }

  useEffect(() => {
    loadAdminData();
  }, []);

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      const search = query.toLowerCase();

      return (
        business.name.toLowerCase().includes(search) ||
        business.slug.toLowerCase().includes(search) ||
        (business.category || "").toLowerCase().includes(search) ||
        (business.location || "").toLowerCase().includes(search)
      );
    });
  }, [businesses, query]);

  async function handleStatusChange(requestId: string, status: string) {
    setUpdatingId(requestId);
    setMessage("");

    try {
      await updateDomainRequestStatus({
        requestId,
        status,
        adminNote,
      });

      await loadAdminData();
      setAdminNote("");
      setMessage("Domain request updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update request.";
      setMessage(errorMessage);
    } finally {
      setUpdatingId("");
    }
  }

  async function handleToggleBusinessPublishStatus(
    businessId: string,
    currentStatus: boolean
  ) {
    setUpdatingBusinessId(businessId);
    setMessage("");

    try {
      await updateBusinessPublishStatus({
        businessId,
        isPublished: !currentStatus,
      });

      await loadAdminData();

      setMessage(
        currentStatus
          ? "Business unpublished successfully."
          : "Business published successfully."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update business status.";

      setMessage(errorMessage);
    } finally {
      setUpdatingBusinessId("");
    }
  }

  
  async function handleToggleAdminOverride(
    businessId: string,
    currentStatus: boolean | null
  ) {
    setUpdatingOverrideBusinessId(businessId);
    setMessage("");

    try {
      await updateBusinessAdminOverride({
        businessId,
        isActive: !currentStatus,
      });

      await loadAdminData();

      setMessage(
        currentStatus
          ? "Admin override disabled successfully."
          : "Admin override enabled successfully."
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update admin override.";

      setMessage(errorMessage);
    } finally {
      setUpdatingOverrideBusinessId("");
    }
  }
  async function handleSaveSubscriptionControls(
    event: React.FormEvent<HTMLFormElement>,
    businessId: string
  ) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setUpdatingSubscriptionBusinessId(businessId);
    setMessage("");

    try {
      await updateBusinessSubscriptionControls({
        businessId,
        plan: String(formData.get("plan") || "starter"),
        status: String(formData.get("status") || "trial"),
        expiresAt: toIsoDateTime(formData.get("expiresAt")),
        graceEndsAt: toIsoDateTime(formData.get("graceEndsAt")),
        adminOverrideActive: formData.get("adminOverrideActive") === "on",
        isPublished: formData.get("isPublished") === "on",
      });

      await loadAdminData();

      setMessage("Subscription controls updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to update subscription controls.";

      setMessage(errorMessage);
    } finally {
      setUpdatingSubscriptionBusinessId("");
    }
  }


  const publishedCount = businesses.filter(
    (business) => business.is_published
  ).length;

  const overrideCount = businesses.filter(
    (business) => business.admin_override_active
  ).length;
  const pendingDomainCount = domainRequests.filter(
    (request) => request.status === "pending"
  ).length;

  if (!authChecked) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-slate-950 text-white">
            <Loader2 size={24} className="animate-spin" />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Checking admin access
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Please wait while Market Villa verifies your Admin Center
            permission.
          </p>
        </div>
      </main>
    );
  }

  if (authChecked && !isAuthorized) {
    return (
      <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 text-center shadow-soft">
          <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-red-700">
            <ShieldCheck size={24} />
          </div>

          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            Admin access required
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            You need a Market Villa account with the super_admin role to view
            the Admin Center.
          </p>

          {message ? (
            <div className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <div className="mt-7 grid gap-3">
            <Link
              href="/admin-login"
              className="rounded-full bg-slate-950 px-5 py-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Login as Admin
            </Link>

            <Link
              href="/dashboard"
              className="rounded-full border border-slate-200 px-5 py-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Go to Business Dashboard
            </Link>

            <Link href="/" className="text-sm font-medium text-slate-500">
              Back to website
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <aside className="fixed left-0 top-0 hidden h-screen w-72 border-r border-white/10 bg-slate-950 p-5 text-white lg:block">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white text-slate-950">
            <ShieldCheck size={20} />
          </span>

          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              MARKET VILLA
            </span>
            <span className="block text-lg font-semibold">Admin Center</span>
          </span>
        </Link>

        <nav className="grid gap-2">
          <a
            href="#overview"
            className="flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium text-white"
          >
            <LayoutDashboard size={18} />
            Overview
          </a>

          <a
            href="#businesses"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Building2 size={18} />
            Businesses
          </a>

          <Link
            href="/admin/visibility-requests"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Megaphone size={18} />
            Visibility Requests
          </Link>

          <Link
            href="/admin/revenue"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Banknote size={18} />
            Revenue
          </Link>

          <Link
            href="/admin/pricing"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <BadgeDollarSign size={18} />
            Pricing
          </Link>

          <a
            href="#domains"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Globe2 size={18} />
            Domain Requests
          </a>

          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/10 hover:text-white"
          >
            <Store size={18} />
            Business Dashboard
          </Link>
        </nav>

        <div className="absolute bottom-5 left-5 right-5 rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
          <p className="text-sm font-semibold">Platform Owner View</p>
          <p className="mt-2 text-xs leading-5 text-slate-300">
            This area is only for accounts with the super_admin role.
          </p>
        </div>
      </aside>

      <section className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur-xl">
          <div className="flex items-center justify-between px-5 py-4 md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Admin Center
              </p>

              <h1 className="text-xl font-semibold tracking-tight text-slate-950">
                Manage Market Villa platform activity
              </h1>
            </div>

            <Link
              href="/"
              className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              View Website
            </Link>
          </div>
        </header>

        <div className="grid gap-8 px-5 py-8 md:px-8">
          <section
            id="overview"
            className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft"
          >
            <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
                  Platform Overview
                </p>

                <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
                  Track businesses, subscriptions, and custom domain requests.
                </h2>

                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                  This admin area gives you a simple view of Market Villa
                  activity, businesses, and platform requests from one place.
                </p>
              </div>

              <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
                <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-slate-950">
                  <div>
                    <p className="text-sm font-semibold">Total Businesses</p>
                    <p className="text-xs text-slate-500">
                      All created stores
                    </p>
                  </div>
                  <span className="text-2xl font-semibold">
                    {businesses.length}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
                  <div>
                    <p className="text-sm font-semibold">Pending Domains</p>
                    <p className="text-xs text-slate-300">
                      Awaiting admin review
                    </p>
                  </div>
                  <span className="text-2xl font-semibold">
                    {pendingDomainCount}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {message ? (
            <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
              {message}
            </div>
          ) : null}

          {isLoading ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center text-sm text-slate-500 shadow-sm">
              Loading admin data...
            </section>
          ) : (
            <>
              <section className="grid gap-4 md:grid-cols-5">
                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Businesses</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    {businesses.length}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Published</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    {publishedCount}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Domain Requests</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    {domainRequests.length}
                  </p>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm text-slate-500">Pending Domains</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
                    {pendingDomainCount}
                  </p>
                </div>
              </section>

              <section
                id="businesses"
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                      Businesses
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                      All business pages
                    </h2>
                  </div>

                  <div className="relative md:w-80">
                    <Search
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      className="w-full rounded-full border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-[var(--mv-orange)]"
                      placeholder="Search businesses"
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  {filteredBusinesses.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No businesses found.
                    </div>
                  ) : null}

                  {filteredBusinesses.map((business) => (
                    <article
                      key={business.id}
                      className="rounded-[1.5rem] border border-slate-200 p-5"
                    >
                      <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
                        <div>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {business.category || "Uncategorized"}
                            </span>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                business.is_published
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {business.is_published ? "Published" : "Draft"}
                            </span>

                            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                              {business.subscription_plan}
                            </span>

                            <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                              {business.subscription_status}
                            </span>
                          </div>

                          <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                            {business.name}
                          </h3>

                          <p className="mt-2 text-sm text-slate-500">
                            /store/{business.slug}
                          </p>

                          <p className="mt-2 text-sm text-slate-500">
                            {business.location || "No location added"}
                          </p>

                          {business.custom_domain ? (
                            <p className="mt-2 text-sm text-slate-500">
                              Domain: {business.custom_domain} (
                              {business.custom_domain_status})
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/store/${business.slug}`}
                            className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                          >
                            View Store
                            <ArrowRight size={16} />
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleBusinessPublishStatus(
                                business.id,
                                business.is_published
                              )
                            }
                            disabled={updatingBusinessId === business.id}
                            className={`rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                              business.is_published
                                ? "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100"
                                : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
                            }`}
                          >
                            {updatingBusinessId === business.id
                              ? "Updating..."
                              : business.is_published
                              ? "Unpublish"
                              : "Publish"}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleAdminOverride(
                                business.id,
                                business.admin_override_active
                              )
                            }
                            disabled={updatingOverrideBusinessId === business.id}
                            className={`rounded-full px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60 ${
                              business.admin_override_active
                                ? "bg-purple-700 text-white hover:bg-purple-800"
                                : "bg-purple-50 text-purple-700 ring-1 ring-purple-200 hover:bg-purple-100"
                            }`}
                          >
                            {updatingOverrideBusinessId === business.id
                              ? "Updating..."
                              : business.admin_override_active
                              ? "Disable Override"
                              : "Enable Override"}
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section
                id="domains"
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="mb-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                    Domain Requests
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                    Review custom domain requests
                  </h2>
                </div>

                <div className="grid gap-4">
                  {domainRequests.length === 0 ? (
                    <div className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-slate-500">
                      No domain requests yet.
                    </div>
                  ) : null}

                  {domainRequests.map((request) => (
                    <article
                      key={request.id}
                      className="rounded-[1.5rem] border border-slate-200 p-5"
                    >
                      <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-start">
                        <div>
                          <div className="mb-3 flex flex-wrap gap-2">
                            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                              {request.businesses?.name || "Unknown business"}
                            </span>

                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                              {request.status}
                            </span>

                            {request.already_owned ? (
                              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Already owned
                              </span>
                            ) : (
                              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                                Needs purchase help
                              </span>
                            )}
                          </div>

                          <h3 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                            {request.requested_domain}
                          </h3>

                          {request.alternative_domain ? (
                            <p className="mt-2 text-sm text-slate-500">
                              Alternative: {request.alternative_domain}
                            </p>
                          ) : null}

                          {request.contact_phone ? (
                            <p className="mt-2 text-sm text-slate-500">
                              Contact: {request.contact_phone}
                            </p>
                          ) : null}

                          {request.note ? (
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
                              {request.note}
                            </p>
                          ) : null}

                          {request.admin_note ? (
                            <p className="mt-3 max-w-2xl rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                              Admin note: {request.admin_note}
                            </p>
                          ) : null}
                        </div>

                        <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4 xl:w-80">
                          <textarea
                            value={adminNote}
                            onChange={(event) =>
                              setAdminNote(event.target.value)
                            }
                            rows={3}
                            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--mv-orange)]"
                            placeholder="Admin note for this update"
                          />

                          <div className="grid gap-2">
                            {statusOptions.map((status) => (
                              <button
                                key={status}
                                onClick={() =>
                                  handleStatusChange(request.id, status)
                                }
                                disabled={updatingId === request.id}
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white disabled:opacity-60"
                              >
                                {updatingId === request.id ? (
                                  <Loader2
                                    size={14}
                                    className="animate-spin"
                                  />
                                ) : status === request.status ? (
                                  <CheckCircle2 size={14} />
                                ) : (
                                  <Clock3 size={14} />
                                )}
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </section>
    </main>
  );
}





