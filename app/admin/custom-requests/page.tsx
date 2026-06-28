"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";

type AdminCustomRequest = {
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
  businesses?: {
    name?: string | null;
    slug?: string | null;
  } | null;
};

const statusOptions = ["pending", "reviewing", "quoted", "approved", "in_progress", "completed", "rejected"];

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function AdminCustomRequestsPage() {
  const [requests, setRequests] = useState<AdminCustomRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("custom_requests")
        .select(
          `
          id,
          business_id,
          request_type,
          title,
          details,
          reference_url,
          budget,
          priority,
          status,
          admin_note,
          created_at,
          businesses (
            name,
            slug
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = (data || []) as AdminCustomRequest[];

      setRequests(items);

      const notes: Record<string, string> = {};

      items.forEach((request) => {
        notes[request.id] = request.admin_note || "";
      });

      setAdminNotes(notes);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load requests.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(requestId: string, status: string) {
    setProcessingId(requestId);
    setMessage("");

    try {
      const { error } = await supabase
        .from("custom_requests")
        .update({
          status,
          admin_note: adminNotes[requestId] || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", requestId);

      if (error) throw error;

      setMessage("Request updated.");
      await loadRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update request.";

      setMessage(errorMessage);
    } finally {
      setProcessingId("");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f1ff] px-5">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1ff] px-5 py-8 text-slate-950 md:px-5">
      <section className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:border-[#7c3aed]/40 hover:text-[#7c3aed]"
          >
            <ArrowLeft size={16} />
            Back to Admin
          </Link>

          <button
            type="button"
            onClick={loadRequests}
            className="inline-flex items-center rounded-full bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6d28d9]"
          >
            Refresh
          </button>
        </div>

        <section className="border border-slate-200 bg-slate-950 p-6 text-white shadow-sm md:p-8">

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.06em]">
            Custom theme and shop customization requests.
          </h1>
        </section>

        {message ? (
          <div className="mt-5 border border-purple-200 bg-white p-4 text-sm text-slate-700">
            {message}
          </div>
        ) : null}

        <section className="mt-5 grid gap-4">
          {requests.length > 0 ? (
            requests.map((request) => (
              <article
                key={request.id}
                className="border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 xl:grid-cols-[1fr_0.7fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed] ring-1 ring-purple-100">
                        <Sparkles size={13} />
                        {request.request_type === "custom_theme"
                          ? "Custom Theme"
                          : "Customize Shop"}
                      </span>

                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600 ring-1 ring-slate-200">
                        {request.status || "pending"}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-500 ring-1 ring-slate-200">
                        {request.priority || "normal"}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                      {request.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {request.businesses?.name || "Unknown business"} â€” /store/
                      {request.businesses?.slug || "no-slug"}
                    </p>

                    <p className="mt-4 text-sm leading-7 text-slate-600">
                      {request.details}
                    </p>

                    <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-3">
                      <p>
                        <span className="font-semibold text-slate-700">
                          Budget:
                        </span>{" "}
                        {request.budget || "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-700">
                          Reference:
                        </span>{" "}
                        {request.reference_url ? (
                          <a
                            href={request.reference_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7c3aed] underline"
                          >
                            Open
                          </a>
                        ) : (
                          "None"
                        )}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-700">
                          Sent:
                        </span>{" "}
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="grid content-start gap-3">
                    <label className="grid gap-2 text-sm font-semibold text-slate-700">
                      Admin note
                      <textarea
                        value={adminNotes[request.id] || ""}
                        onChange={(event) =>
                          setAdminNotes((notes) => ({
                            ...notes,
                            [request.id]: event.target.value,
                          }))
                        }
                        rows={5}
                        className="border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                        placeholder="Add quote, timeline, next step, or internal note"
                      />
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateRequest(request.id, status)}
                          disabled={processingId === request.id}
                          className={`rounded-full px-4 py-2.5 text-xs font-semibold capitalize transition disabled:cursor-not-allowed disabled:opacity-60 ${
                            request.status === status
                              ? "bg-[#7c3aed] text-white"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {processingId === request.id ? "Saving..." : status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            ))
          ) : null}
        </section>
      </section>
    </main>
  );
}



