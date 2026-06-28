"use client";

import { FormEvent, useEffect, useState } from "react";
import { CheckCircle2, Loader2, Palette } from "lucide-react";
import { getMyBusinesses } from "@/lib/business-actions";
import { supabase } from "@/lib/supabase";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
};

type CustomRequest = {
  id: string;
  business_id: string;
  request_type: string;
  title: string;
  details: string;
  reference_url?: string | null;
  budget?: string | null;
  priority?: string | null;
  status?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CustomRequestsPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [requests, setRequests] = useState<CustomRequest[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [requestType, setRequestType] = useState<"custom_theme" | "customize_shop">(
    "customize_shop"
  );
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [referenceUrl, setReferenceUrl] = useState("");
  const [budget, setBudget] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function loadData() {
    setIsLoading(true);
    setMessage("");

    try {
      const businessItems = await getMyBusinesses();

      setBusinesses(businessItems);

      if (businessItems.length > 0) {
        setSelectedBusinessId((current) => current || businessItems[0].id);

        const businessIds = businessItems.map((business) => business.id);

        const { data, error } = await supabase
          .from("custom_requests")
          .select("*")
          .in("business_id", businessIds)
          .order("created_at", { ascending: false });

        if (error) throw error;

        setRequests((data || []) as CustomRequest[]);
      } else {
        setRequests([]);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load requests.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBusinessId) {
      setMessage("Create a business first before sending a request.");
      return;
    }

    if (!title.trim() || !details.trim()) {
      setMessage("Add a title and details for your request.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const { error } = await supabase.from("custom_requests").insert({
        business_id: selectedBusinessId,
        request_type: requestType,
        title: title.trim(),
        details: details.trim(),
        reference_url: referenceUrl.trim() || null,
        budget: budget.trim() || null,
        priority,
        status: "pending",
      });

      if (error) throw error;

      setTitle("");
      setDetails("");
      setReferenceUrl("");
      setBudget("");
      setPriority("normal");
      setMessage("Request sent successfully.");
      await loadData();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to submit request.";

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={26} />
        </div>
      </main>
    );
  }

  return (
    <div className="grid gap-5">

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
        <form
          onSubmit={handleSubmit}
          className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="mb-5">
            <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Tell us what you want changed.
            </h2>
          </div>

          <div className="grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Business
              <select
                value={selectedBusinessId}
                onChange={(event) => setSelectedBusinessId(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              >
                {businesses.map((business) => (
                  <option key={business.id} value={business.id}>
                    {business.name} â€” /store/{business.slug}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                type="button"
                onClick={() => setRequestType("customize_shop")}
                className={`rounded-2xl border p-4 text-left transition ${
                  requestType === "customize_shop"
                    ? "border-[#7c3aed] bg-purple-50 text-[#211331]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <CheckCircle2 size={18} />
              </button>

              <button
                type="button"
                onClick={() => setRequestType("custom_theme")}
                className={`rounded-2xl border p-4 text-left transition ${
                  requestType === "custom_theme"
                    ? "border-[#7c3aed] bg-purple-50 text-[#211331]"
                    : "border-slate-200 bg-white text-slate-600"
                }`}
              >
                <Palette size={18} />
              </button>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Request title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: Make my fashion shop look more luxury"
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Details
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={6}
                placeholder="Describe the exact changes you want. You can mention colors, layout, references, pages, sections, or examples."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Reference link
                <input
                  value={referenceUrl}
                  onChange={(event) => setReferenceUrl(event.target.value)}
                  placeholder="https://example.com"
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Budget
                <input
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="Example: â‚¦20,000"
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Priority
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="low">Low</option>
              </select>
            </label>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <CheckCircle2 size={17} />
              )}
              {isSubmitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Your requests
              </h2>
            </div>

            <span className="rounded-full bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
              {requests.length} records
            </span>
          </div>

          <div className="grid gap-3">
            {requests.length > 0 ? (
              requests.map((request) => (
                <article
                  key={request.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-700 ring-1 ring-slate-200">
                      {request.request_type === "custom_theme"
                        ? "Custom Theme"
                        : "Customize Shop"}
                    </span>

                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold capitalize text-[#7c3aed] ring-1 ring-purple-100">
                      {request.status || "pending"}
                    </span>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-500 ring-1 ring-slate-200">
                      {request.priority || "normal"}
                    </span>
                  </div>

                  <h3 className="mt-3 text-sm font-semibold text-slate-950">
                    {request.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {request.details}
                  </p>

                  {request.admin_note ? (
                    <p className="mt-3 rounded-2xl bg-white p-3 text-sm leading-6 text-slate-600 ring-1 ring-slate-200">
                      Admin note: {request.admin_note}
                    </p>
                  ) : null}

                  <p className="mt-3 text-xs text-slate-400">
                    Sent {formatDate(request.created_at)}
                  </p>
                </article>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
                No custom requests yet.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}

