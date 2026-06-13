"use client";

import Image from "next/image";
import { FormEvent, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Globe2,
  Info,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import {
  createDomainRequest,
  getDomainRequestsByBusinessId,
  getMyBusinesses,
} from "@/lib/business-actions";

const domainSteps = [
  {
    title: "Submit request",
    description:
      "Tell us the domain name you want or the domain you already own.",
  },
  {
    title: "Availability check",
    description:
      "We confirm if the requested domain is available and send setup pricing.",
  },
  {
    title: "Payment and setup",
    description:
      "After payment, Market Villa connects the domain to your business page.",
  },
  {
    title: "Go live",
    description:
      "Your customers can visit your business directly from your custom domain.",
  },
];

const pricing = [
  {
    title: "Domain Setup",
    price: "â‚¦25,000",
    note: "One-time setup fee if you already own the domain.",
  },
  {
    title: "Managed Domain",
    price: "â‚¦45,000 - â‚¦75,000",
    note: "Includes domain purchase support, setup, and first-year management.",
  },
  {
    title: "Annual Renewal Support",
    price: "â‚¦15,000 - â‚¦25,000",
    note: "Optional yearly support for renewal reminders and domain management.",
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

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = businesses.find(
    (business) => business.id === selectedBusinessId
  );

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

      setRequestedDomain("");
      setAlternativeDomain("");
      setAlreadyOwned(false);
      setContactPhone("");
      setNote("");

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

  const latestRequest = requests[0];

  return (
    <div className="grid gap-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-center gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-teal-100 ring-1 ring-white/15">
              <Globe2 size={17} />
              Paid add-on
            </div>

            <h2 className="max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Give your business a custom domain.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Your Market Villa page already works with a platform link. A
              custom domain gives your business a more professional web address,
              such as zcastastybites.com or sleekstitchatelier.com.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
              Current Store URL
            </p>

            <div className="mt-4 rounded-2xl bg-white p-4 text-slate-950">
              <p className="break-all text-sm font-semibold">
                {selectedBusiness
                  ? `marketvilla.com/store/${selectedBusiness.slug}`
                  : "Create a business page first"}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                This link is included with your subscription. Custom domains are
                available as a paid setup request.
              </p>
            </div>

            <div className="mt-4 rounded-2xl bg-amber-300/15 p-4 text-sm leading-6 text-amber-100 ring-1 ring-amber-200/20">
              {latestRequest
                ? `Latest request: ${latestRequest.requested_domain} (${latestRequest.status})`
                : "Custom domain is not active yet."}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Business
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Select business page
            </h3>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950 md:min-w-80"
          >
            {businesses.length === 0 ? (
              <option value="">No business created yet</option>
            ) : null}

            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} â€” /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {isLoading ? (
        <section className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
          Loading your businesses...
        </section>
      ) : businesses.length === 0 ? (
        <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
          <h3 className="text-lg font-semibold text-amber-950">
            Create a business page first
          </h3>
          <p className="mt-2 text-sm text-amber-900">
            Go to onboarding and create your first business page before
            requesting a custom domain.
          </p>
        </section>
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1fr_0.85fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-7">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
                Request Domain
              </p>

              <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Submit a custom domain request
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Your request will be saved to Supabase and reviewed later from
                the admin dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-5">
              <div className="grid gap-5 md:grid-cols-2">
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Business name
                  </span>
                  <input
                    value={selectedBusiness?.name || ""}
                    readOnly
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm outline-none"
                  />
                </label>

                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Contact phone
                  </span>
                  <input
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                    placeholder="080..."
                  />
                </label>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Preferred domain name
                </span>
                <input
                  value={requestedDomain}
                  onChange={(event) => setRequestedDomain(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="example: zcastastybites.com"
                  required
                />
              </label>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Alternative domain name
                </span>
                <input
                  value={alternativeDomain}
                  onChange={(event) => setAlternativeDomain(event.target.value)}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="example: zcastastybites.ng"
                />
              </label>

              <div className="grid gap-3 rounded-[1.5rem] bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-800">
                  Do you already own this domain?
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ownership"
                      checked={alreadyOwned}
                      onChange={() => setAlreadyOwned(true)}
                    />
                    Yes, I already own it
                  </label>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-medium text-slate-700">
                    <input
                      type="radio"
                      name="ownership"
                      checked={!alreadyOwned}
                      onChange={() => setAlreadyOwned(false)}
                    />
                    No, I want Market Villa to help
                  </label>
                </div>
              </div>

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-700">
                  Extra note
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950"
                  placeholder="Tell us anything important about your domain request."
                />
              </label>

              {message ? (
                <div className="rounded-2xl bg-slate-100 p-4 text-sm text-slate-700">
                  {message}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex w-fit items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 size={17} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={17} />
                )}
                {isSaving ? "Submitting request..." : "Submit Domain Request"}
              </button>
            </form>
          </div>

          <div className="grid gap-5">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <ShieldCheck size={20} />
                </span>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Domain Status
                  </h3>
                  <p className="text-sm text-slate-500">
                    {latestRequest ? latestRequest.status : "Not requested yet"}
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="text-slate-500">Custom domain</span>
                  <span className="font-semibold text-slate-950">
                    {latestRequest ? latestRequest.requested_domain : "Inactive"}
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="text-slate-500">Setup payment</span>
                  <span className="font-semibold text-slate-950">Pending</span>
                </div>

                <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 text-sm">
                  <span className="text-slate-500">SSL certificate</span>
                  <span className="font-semibold text-slate-950">Not active</span>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
                  <CreditCard size={20} />
                </span>

                <div>
                  <h3 className="font-semibold text-slate-950">
                    Pricing Guide
                  </h3>
                  <p className="text-sm text-slate-500">
                    Custom domain is a paid add-on
                  </p>
                </div>
              </div>

              <div className="grid gap-3">
                {pricing.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-slate-950">
                          {item.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {item.note}
                        </p>
                      </div>

                      <span className="whitespace-nowrap rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                        {item.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {requests.length ? (
              <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-semibold text-slate-950">
                  Request History
                </h3>

                <div className="mt-4 grid gap-3">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="rounded-2xl bg-slate-50 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">
                          {request.requested_domain}
                        </p>

                        <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
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
          </div>
        </section>
      )}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-7">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
            Setup Process
          </p>

          <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
            How custom domains work
          </h3>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {domainSteps.map((step, index) => (
            <div
              key={step.title}
              className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5"
            >
              <span className="mb-8 grid h-10 w-10 place-items-center rounded-full bg-slate-950 text-sm font-semibold text-white">
                {index + 1}
              </span>

              <h4 className="font-semibold text-slate-950">{step.title}</h4>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-amber-200 bg-amber-50 p-5">
        <div className="flex gap-3">
          <Info className="mt-1 shrink-0 text-amber-700" size={20} />

          <div>
            <h3 className="font-semibold text-amber-950">
              Important domain note
            </h3>

            <p className="mt-2 text-sm leading-6 text-amber-900">
              Domain names are subject to availability and yearly renewal.
              Market Villa can help with setup, but the business owner should
              understand that domain ownership and renewal must be maintained
              every year.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
