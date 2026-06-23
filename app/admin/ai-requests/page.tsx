"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bot,
  CheckCircle2,
  Loader2,
  PauseCircle,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type AiRequest = {
  id: string;
  business_id: string;
  request_type: string;
  title: string;
  details: string;
  whatsapp_number?: string | null;
  business_tone?: string | null;
  common_questions?: string | null;
  training_notes?: string | null;
  budget?: string | null;
  priority?: string | null;
  status?: string | null;
  admin_note?: string | null;
  created_at?: string | null;
  businesses?: {
    name?: string | null;
    slug?: string | null;
    ai_assistant_enabled?: boolean | null;
    ai_assistant_status?: string | null;
  } | null;
};

const statusOptions = [
  "pending",
  "reviewing",
  "quoted",
  "setup",
  "active",
  "paused",
  "rejected",
];

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusLabel(status?: string | null) {
  if (!status) return "Pending";
  return status.replaceAll("_", " ");
}

function getStatusClass(status?: string | null) {
  if (status === "active") {
    return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "pending" || status === "reviewing" || status === "setup") {
    return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (status === "paused" || status === "rejected") {
    return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function AdminAiRequestsPage() {
  const [requests, setRequests] = useState<AiRequest[]>([]);
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState("");
  const [message, setMessage] = useState("");

  async function loadRequests() {
    setIsLoading(true);
    setMessage("");

    try {
      const { data, error } = await supabase
        .from("ai_assistant_requests")
        .select(
          `
          id,
          business_id,
          request_type,
          title,
          details,
          whatsapp_number,
          business_tone,
          common_questions,
          training_notes,
          budget,
          priority,
          status,
          admin_note,
          created_at,
          businesses (
            name,
            slug,
            ai_assistant_enabled,
            ai_assistant_status
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const items = (data || []) as AiRequest[];

      setRequests(items);

      const notes: Record<string, string> = {};

      items.forEach((request) => {
        notes[request.id] = request.admin_note || "";
      });

      setAdminNotes(notes);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load AI requests.";

      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadRequests();
  }, []);

  async function updateRequest(request: AiRequest, status: string) {
    setProcessingId(request.id);
    setMessage("");

    try {
      const isActive = status === "active";

      const { error: requestError } = await supabase
        .from("ai_assistant_requests")
        .update({
          status,
          admin_note: adminNotes[request.id] || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.id);

      if (requestError) throw requestError;

      const { error: businessError } = await supabase
        .from("businesses")
        .update({
          ai_assistant_status: status,
          ai_assistant_enabled: isActive,
          ai_assistant_notes: adminNotes[request.id] || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", request.business_id);

      if (businessError) throw businessError;

      setMessage(
        isActive
          ? "AI assistant activated for this business."
          : "AI request updated.",
      );

      await loadRequests();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update AI request.";

      setMessage(errorMessage);
    } finally {
      setProcessingId("");
    }
  }

  async function quickPause(request: AiRequest) {
    await updateRequest(request, "paused");
  }

  async function quickActivate(request: AiRequest) {
    await updateRequest(request, "active");
  }

  if (isLoading) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f1ff] px-5">
        <div className="border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
          <p className="mt-4 text-sm text-slate-500">
            Loading AI requests...
          </p>
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
            className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed] px-5 py-3 text-sm font-semibold text-white hover:bg-[#6d28d9]"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <section className="border border-slate-200 bg-slate-950 p-6 text-white shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#c4b5fd]">
            AI Assistant Requests
          </p>

          <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.06em]">
            Review and activate store AI assistants.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/60">
            Businesses can request AI for their public store page. Approve only
            when their setup is ready, because active stores will later show the
            floating store assistant.
          </p>
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
                <div className="grid gap-5 xl:grid-cols-[1fr_0.72fr]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#7c3aed] ring-1 ring-purple-100">
                        <Bot size={13} />
                        AI Assistant
                      </span>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusClass(
                          request.status,
                        )}`}
                      >
                        {getStatusLabel(request.status)}
                      </span>

                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-slate-500 ring-1 ring-slate-200">
                        {request.priority || "normal"}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-semibold tracking-[-0.04em] text-slate-950">
                      {request.title}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {request.businesses?.name || "Unknown business"} — /store/
                      {request.businesses?.slug || "no-slug"}
                    </p>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600">
                      <p className="leading-7">{request.details}</p>

                      {request.common_questions ? (
                        <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Common questions
                          </p>
                          <p className="mt-2 leading-6">
                            {request.common_questions}
                          </p>
                        </div>
                      ) : null}

                      {request.training_notes ? (
                        <div className="rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-200">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Training notes
                          </p>
                          <p className="mt-2 leading-6">
                            {request.training_notes}
                          </p>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-slate-500 md:grid-cols-4">
                      <p>
                        <span className="font-semibold text-slate-700">
                          WhatsApp:
                        </span>{" "}
                        {request.whatsapp_number || "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-700">
                          Tone:
                        </span>{" "}
                        {request.business_tone || "Not provided"}
                      </p>

                      <p>
                        <span className="font-semibold text-slate-700">
                          Budget:
                        </span>{" "}
                        {request.budget || "Not provided"}
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
                        placeholder="Add setup note, quote, timeline, or reason for rejection"
                      />
                    </label>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() => quickActivate(request)}
                        disabled={processingId === request.id}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <CheckCircle2 size={15} />
                        Activate
                      </button>

                      <button
                        type="button"
                        onClick={() => quickPause(request)}
                        disabled={processingId === request.id}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <PauseCircle size={15} />
                        Pause
                      </button>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      {statusOptions.map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => updateRequest(request, status)}
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

                    {request.businesses?.ai_assistant_enabled ? (
                      <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-200">
                        Store AI is currently active.
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-500 ring-1 ring-slate-200">
                        Store AI is not active yet.
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
              No AI assistant requests yet.
            </div>
          )}
        </section>
      </section>
    </main>
  );
}