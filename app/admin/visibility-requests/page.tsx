"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Loader2,
  Megaphone,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type VisibilityRequest = {
  id: string;
  business_id: string;
  owner_id: string;
  request_type?: string | null;
  status?: string | null;
  message?: string | null;
  admin_note?: string | null;
  requested_days?: number | null;
  requested_at?: string | null;
  created_at?: string | null;
  businesses?: {
    name?: string | null;
    slug?: string | null;
    is_featured?: boolean | null;
    is_verified?: boolean | null;
    weekly_views?: number | null;
    total_views?: number | null;
  } | null;
};

function formatDate(value?: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getStatusClass(status?: string | null) {
  const cleanStatus = String(status || "pending").toLowerCase();

  if (cleanStatus === "approved") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (cleanStatus === "rejected") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-purple-50 text-purple-700 ring-purple-200";
}

export default function AdminVisibilityRequestsPage() {
  const [requests, setRequests] = useState<VisibilityRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("visibility_requests")
        .select(
          `
          id,
          business_id,
          owner_id,
          request_type,
          status,
          message,
          admin_note,
          requested_days,
          requested_at,
          created_at,
          businesses (
            name,
            slug,
            is_featured,
            is_verified,
            weekly_views,
            total_views
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests((data || []) as VisibilityRequest[]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load visibility requests.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  async function approveRequest(request: VisibilityRequest) {
    setProcessingId(request.id);
    setMessage("");

    try {
      const now = new Date();
      const featuredUntil = new Date(now);
      featuredUntil.setDate(
        featuredUntil.getDate() + Number(request.requested_days || 7)
      );

      const { error: businessError } = await supabase
        .from("businesses")
        .update({
          is_featured: true,
          featured_until: featuredUntil.toISOString(),
          visibility_plan: "featured",
          updated_at: now.toISOString(),
        })
        .eq("id", request.business_id);

      if (businessError) throw businessError;

      const { error: requestError } = await supabase
        .from("visibility_requests")
        .update({
          status: "approved",
          admin_note: "Featured placement approved.",
          reviewed_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", request.id);

      if (requestError) throw requestError;

      setMessage("Featured placement approved.");
      await loadRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to approve request.";

      setMessage(errorMessage);
    } finally {
      setProcessingId("");
    }
  }

  async function rejectRequest(request: VisibilityRequest) {
    setProcessingId(request.id);
    setMessage("");

    try {
      const now = new Date();

      const { error } = await supabase
        .from("visibility_requests")
        .update({
          status: "rejected",
          admin_note: "Featured placement rejected.",
          reviewed_at: now.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", request.id);

      if (error) throw error;

      setMessage("Featured placement request rejected.");
      await loadRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to reject request.";

      setMessage(errorMessage);
    } finally {
      setProcessingId("");
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center bg-[#f7f1ff] px-5 py-12">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading visibility requests...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ff] px-5 py-8 text-slate-950 md:px-5">
      <section className="mx-auto max-w-7xl">
        <div className="border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7c3aed]">
                Admin
              </p>

              <h1 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                Visibility requests
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review featured placement requests from businesses and activate
                store visibility boosts.
              </p>
            </div>

            <button
              type="button"
              onClick={loadRequests}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#7c3aed]/40 hover:text-[#7c3aed]"
            >
              Refresh
            </button>
          </div>
        </div>

        {message ? (
          <div className="mt-5 border border-purple-200 bg-purple-50 p-4 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <div className="mt-5 grid gap-4">
          {requests.length > 0 ? (
            requests.map((request) => {
              const business = request.businesses;
              const status = String(request.status || "pending");
              const isPending = status === "pending";
              const isProcessing = processingId === request.id;

              return (
                <article
                  key={request.id}
                  className="border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusClass(
                            status
                          )}`}
                        >
                          {status}
                        </span>

                        <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed] ring-1 ring-purple-100">
                          {request.requested_days || 7} days requested
                        </span>

                        {business?.is_featured ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#26143d] px-3 py-1 text-xs font-semibold text-white">
                            <Megaphone size={13} />
                            Currently featured
                          </span>
                        ) : null}

                        {business?.is_verified ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                            <BadgeCheck size={13} />
                            Verified
                          </span>
                        ) : null}
                      </div>

                      <h2 className="text-xl font-semibold tracking-[-0.04em] text-slate-950">
                        {business?.name || "Untitled business"}
                      </h2>

                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {request.message ||
                          "Business requested featured placement."}
                      </p>

                      <div className="mt-4 grid gap-3 text-sm text-slate-500 md:grid-cols-3">
                        <div className="border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Slug
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            /store/{business?.slug || "no-slug"}
                          </p>
                        </div>

                        <div className="border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Weekly views
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {Number(business?.weekly_views || 0).toLocaleString()}
                          </p>
                        </div>

                        <div className="border border-slate-200 bg-slate-50 p-3">
                          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">
                            Requested
                          </p>
                          <p className="mt-1 font-semibold text-slate-700">
                            {formatDate(request.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3 xl:justify-end">
                      <button
                        type="button"
                        onClick={() => approveRequest(request)}
                        disabled={!isPending || isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#8b5cf6] disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <CheckCircle2 size={16} />
                        )}
                        Approve
                      </button>

                      <button
                        type="button"
                        onClick={() => rejectRequest(request)}
                        disabled={!isPending || isProcessing}
                        className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <XCircle size={16} />
                        Reject
                      </button>
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="border border-dashed border-slate-300 bg-white p-10 text-center">
              <Clock3 className="mx-auto text-slate-400" size={34} />
              <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                No visibility requests yet
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                When businesses request featured placement, they will appear
                here for review.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}