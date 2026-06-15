"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  Globe2,
  Info,
  Loader2,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  createDomainRequest,
  getDomainRequestsByBusinessId,
  getMyBusinesses,
} from "@/lib/business-actions";

const pricing = [
  {
    title: "Setup",
    price: "\u20A625,000",
    note: "For domains already owned by the business.",
  },
  {
    title: "Managed",
    price: "\u20A645,000 - \u20A675,000",
    note: "Purchase support, setup, and first-year management.",
  },
  {
    title: "Renewal",
    price: "\u20A615,000 - \u20A625,000",
    note: "Optional yearly support and renewal reminders.",
  },
];

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  custom_domain: string | null;
  custom_domain_status: string;
};

type DomainRequest = {
  id: string;
  requested_domain: string;
  alternative_domain: string | null;
  already_owned: boolean;
  contact_phone: string | null;
  note: string | null;
  status: string;
  created_at: string;
};

export default function DomainPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [requests, setRequests] = useState<DomainRequest[]>([]);

  const [requestedDomain, setRequestedDomain] = useState("");
  const [alternativeDomain, setAlternativeDomain] = useState("");
  const [alreadyOwned, setAlreadyOwned] = useState(false);
  const [contactPhone, setContactPhone] = useState("");
  const [note, setNote] = useState("");

  const [isDomainFormOpen, setIsDomainFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

  const latestRequest = requests[0];

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
    let mounted = true;

    async function loadRequests() {
      if (!selectedBusinessId) {
        setRequests([]);
        return;
      }

      try {
        const items = await getDomainRequestsByBusinessId(selectedBusinessId);

        if (!mounted) return;

        setRequests(items);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load requests.";
        setMessage(errorMessage);
      }
    }

    loadRequests();

    return () => {
      mounted = false;
    };
  }, [selectedBusinessId]);

  function clearFormFields() {
    setRequestedDomain("");
    setAlternativeDomain("");
    setAlreadyOwned(false);
    setContactPhone("");
    setNote("");
  }

  function closeDomainForm() {
    clearFormFields();
    setIsDomainFormOpen(false);
  }

  function openDomainForm() {
    clearFormFields();
    setMessage("");
    setIsDomainFormOpen(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setMessage("Create a business page first before requesting a domain.");
      return;
    }

    setIsSaving(true);
    setMessage("");

    try {
      await createDomainRequest({
        businessId: selectedBusinessId,
        requestedDomain,
        alternativeDomain,
        alreadyOwned,
        contactPhone,
        note,
      });

      const updatedRequests =
        await getDomainRequestsByBusinessId(selectedBusinessId);

      setRequests(updatedRequests);
      closeDomainForm();
      setMessage("Domain request submitted successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to submit domain request.";

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
          <p className="mt-3 text-sm text-slate-500">Loading domain page...</p>
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
          Add your business profile before requesting a custom domain.
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
              onChange={(event) => {
                setSelectedBusinessId(event.target.value);
                closeDomainForm();
              }}
              className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100 md:min-w-72"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} - /store/{business.slug}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={openDomainForm}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              <Plus size={17} />
              Request Domain
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-slate-50 px-3 py-2.5">
              <p className="text-xs text-slate-500">Requests</p>
              <p className="mt-1 text-base font-semibold text-slate-950">
                {requests.length}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5">
              <p className="text-xs text-emerald-700">Domain</p>
              <p className="mt-1 max-w-28 truncate text-sm font-semibold text-emerald-950">
                {selectedBusiness?.custom_domain || "Inactive"}
              </p>
            </div>

            <div className="rounded-2xl bg-purple-50 px-3 py-2.5">
              <p className="text-xs text-purple-700">Status</p>
              <p className="mt-1 max-w-28 truncate text-sm font-semibold text-purple-950">
                {latestRequest?.status ||
                  selectedBusiness?.custom_domain_status ||
                  "None"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {message && !isDomainFormOpen ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section
        className={`grid gap-5 ${
          isDomainFormOpen
            ? "xl:grid-cols-[0.9fr_1.1fr]"
            : "xl:grid-cols-[1fr]"
        }`}
      >
        {isDomainFormOpen ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600">
                New Request
              </span>

              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                <Globe2 size={20} />
              </span>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-4">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Business
                  </span>

                  <input
                    value={selectedBusiness?.name || ""}
                    readOnly
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Phone
                  </span>

                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    placeholder="080..."
                  />
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Preferred domain
                  </span>

                  <input
                    value={requestedDomain}
                    onChange={(event) => setRequestedDomain(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    placeholder="yourbusiness.com"
                    required
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Alternative domain
                  </span>

                  <input
                    value={alternativeDomain}
                    onChange={(event) =>
                      setAlternativeDomain(event.target.value)
                    }
                    className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                    placeholder="yourbusiness.ng"
                  />
                </label>
              </div>

              <div className="grid gap-3 rounded-[1.25rem] bg-slate-50 p-3">
                <p className="text-sm font-semibold text-slate-800">
                  Domain ownership
                </p>

                <div className="grid gap-2 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ownership"
                      checked={alreadyOwned}
                      onChange={() => setAlreadyOwned(true)}
                    />
                    I own it
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ownership"
                      checked={!alreadyOwned}
                      onChange={() => setAlreadyOwned(false)}
                    />
                    Help me get it
                  </label>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Note
                </span>

                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={3}
                  className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-[var(--mv-violet)] focus:ring-4 focus:ring-slate-100"
                  placeholder="Add anything important."
                />
              </label>

              {message ? (
                <div className="rounded-2xl bg-slate-100 p-3 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}

                  {isSaving ? "Submitting..." : "Submit Request"}
                </button>

                <button
                  type="button"
                  onClick={closeDomainForm}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  <X size={17} />
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : null}

        <div className="grid content-start gap-4 lg:grid-cols-2">
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <ShieldCheck size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Domain Status</p>
                <p className="text-sm text-slate-500">
                  {latestRequest ? latestRequest.status : "Not requested"}
                </p>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Domain</span>
                <span className="truncate font-semibold text-slate-950">
                  {latestRequest ? latestRequest.requested_domain : "Inactive"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">Payment</span>
                <span className="font-semibold text-slate-950">Pending</span>
              </div>

              <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 p-3 text-sm">
                <span className="text-slate-500">SSL</span>
                <span className="font-semibold text-slate-950">Not active</span>
              </div>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-50 text-purple-700">
                <CreditCard size={19} />
              </span>

              <div>
                <p className="font-semibold text-slate-950">Pricing</p>
                <p className="text-sm text-slate-500">Custom domain add-on</p>
              </div>
            </div>

            <div className="grid gap-2">
              {pricing.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {item.note}
                      </p>
                    </div>

                    <span className="whitespace-nowrap rounded-full bg-[#26143d] px-3 py-1 text-xs font-semibold text-white">
                      {item.price}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {requests.length ? (
            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm lg:col-span-2">
              <p className="font-semibold text-slate-950">Request History</p>

              <div className="mt-3 grid gap-2 md:grid-cols-2">
                {requests.map((request) => (
                  <div key={request.id} className="rounded-2xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-semibold text-slate-950">
                        {request.requested_domain}
                      </p>

                      <span className="rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700">
                        {request.status}
                      </span>
                    </div>

                    <p className="mt-2 text-xs text-slate-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.5rem] border border-purple-200 bg-purple-50 p-4 lg:col-span-2">
            <div className="flex gap-3">
              <Info className="mt-1 shrink-0 text-purple-700" size={18} />

              <p className="text-sm leading-6 text-purple-900">
                Domain names depend on availability and yearly renewal. Keep
                renewal active every year.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}