"use client";

import {
  FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,  Loader2,
  MessageCircle,
  Sparkles
} from "lucide-react";
import {
  getMyBusinesses } from "@/lib/business-actions";
import {
  supabase } from "@/lib/supabase";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  ai_assistant_status?: string | null;
  ai_assistant_enabled?: boolean | null;
};

type AiAssistantRequest = {
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
};

function formatDate(value?: string | null) {
  if (!value) return "Not available";

  return new Intl.DateTimeFormat("en-NG", {
  month: "short",
    day: "numeric",
    year: "numeric"
}).format(new Date(value));
}

function getStatusLabel(status?: string | null) {
  if (!status) return "Not requested";

  return status.replaceAll("_", " ");
}

function getStatusClass(status?: string | null) {
  if (status === "active") {
  return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  }

  if (status === "pending" || status === "reviewing" || status === "setup") {
  return "bg-amber-50 text-amber-700 ring-amber-200";
  }

  if (status === "rejected" || status === "paused") {
  return "bg-red-50 text-red-700 ring-red-200";
  }

  return "bg-slate-100 text-slate-600 ring-slate-200";
}

export default function AiAssistantPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [requests, setRequests] = useState<AiAssistantRequest[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [title, setTitle] = useState("AI assistant setup for my store");
  const [details, setDetails] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [businessTone, setBusinessTone] = useState("friendly");
  const [commonQuestions, setCommonQuestions] = useState("");
  const [trainingNotes, setTrainingNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [priority, setPriority] = useState("normal");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
  return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  async function loadData() {
  setIsLoading(true);
    setMessage("");

    try {
  const businessItems = (await getMyBusinesses()) as DashboardBusiness[];

      setBusinesses(businessItems);

      if (businessItems.length > 0) {
  setSelectedBusinessId((current) => current || businessItems[0].id);

        const businessIds = businessItems.map((business) => business.id);

        const {
  data, error } = await supabase
          .from("ai_assistant_requests")
          .select("*")
          .in("business_id", businessIds)
          .order("created_at", {
  ascending: false });

        if (error) throw error;

        setRequests((data || []) as AiAssistantRequest[]);
      } else {
  setRequests([]);
      }
    } catch (error) {
  const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to load AI assistant requests.";

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
  setMessage("Create a business first before requesting an AI assistant.");
      return;
    }

    if (!title.trim() || !details.trim()) {
  setMessage("Add a title and details for your AI assistant request.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
  const {
  error } = await supabase.from("ai_assistant_requests").insert({
  business_id: selectedBusinessId,
        request_type: "ai_assistant",
        title: title.trim(),
        details: details.trim(),
        whatsapp_number: whatsappNumber.trim() || null,
        business_tone: businessTone,
        common_questions: commonQuestions.trim() || null,
        training_notes: trainingNotes.trim() || null,
        budget: budget.trim() || null,
        priority,
        status: "pending"
});

      if (error) throw error;

      await supabase
        .from("businesses")
        .update({
  ai_assistant_status: "pending",
          ai_assistant_enabled: false,
          updated_at: new Date().toISOString()
})
        .eq("id", selectedBusinessId);

      setTitle("AI assistant setup for my store");
      setDetails("");
      setWhatsappNumber("");
      setBusinessTone("friendly");
      setCommonQuestions("");
      setTrainingNotes("");
      setBudget("");
      setPriority("normal");
      setMessage("AI assistant request sent successfully.");

      await loadData();
    } catch (error) {
  const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to submit AI assistant request.";

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
      <section className="overflow-hidden rounded-[1.75rem] border border-[#e6d9f2] bg-[#211331] p-5 text-white shadow-[0_24px_70px_rgba(36,20,54,0.18)] md:p-7">
        <div className="grid gap-5 xl:grid-cols-[1fr_0.75fr] xl:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/75 ring-1 ring-white/15">
              <Bot size={14} />
              Store AI Assistant
            </span>

            <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.055em] md:text-5xl">
              Request an AI assistant for your store.
            </h1>
          </div>

          <div className="rounded-[1.35rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
            <p className="text-sm font-semibold">AI status</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ${getStatusClass(
                  selectedBusiness?.ai_assistant_status,
                )}`}
              >
                {getStatusLabel(selectedBusiness?.ai_assistant_status)}
              </span>

              {selectedBusiness?.ai_assistant_enabled ? (
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
                  Floating assistant active
                </span>
              ) : null}
            </div>

            <p className="mt-3 text-sm text-white/65">
              {selectedBusiness
                ? `${selectedBusiness.name} â€” /store/${selectedBusiness.slug}`
                : "No business selected"}
            </p>
          </div>
        </div>
      </section>

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
              Tell us how the AI should help.
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

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Request title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Example: AI assistant setup for my store"
                className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              What should the AI help customers with?
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={5}
                placeholder="Example: Answer product questions, explain delivery, collect order details, and guide customers to WhatsApp."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                WhatsApp number
                <input
                  value={whatsappNumber}
                  onChange={(event) => setWhatsappNumber(event.target.value)}
                  placeholder="Example: 2348012345678"
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                />
              </label>

              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                AI tone
                <select
                  value={businessTone}
                  onChange={(event) => setBusinessTone(event.target.value)}
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                >
                  <option value="friendly">Friendly</option>
                  <option value="professional">Professional</option>
                  <option value="premium">Premium</option>
                  <option value="casual">Casual</option>
                  <option value="luxury">Luxury</option>
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Common customer questions
              <textarea
                value={commonQuestions}
                onChange={(event) => setCommonQuestions(event.target.value)}
                rows={4}
                placeholder="Example: Do you deliver? What are your prices? How long does an order take?"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <label className="grid gap-2 text-sm font-semibold text-slate-700">
              Training notes
              <textarea
                value={trainingNotes}
                onChange={(event) => setTrainingNotes(event.target.value)}
                rows={4}
                placeholder="Add important business rules, delivery rules, payment rules, opening hours, or things the AI must not say."
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-700">
                Budget
                <input
                  value={budget}
                  onChange={(event) => setBudget(event.target.value)}
                  placeholder="Example: â‚¦10,000/month"
                  className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-800 outline-none focus:border-[#7c3aed]"
                />
              </label>

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
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <MessageCircle size={17} />
              )}
              {isSubmitting ? "Sending..." : "Request AI Assistant"}
            </button>
          </div>
        </form>

        <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-end justify-between gap-3">
            <div>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                AI requests
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
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
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
                No AI assistant requests yet.
              </div>
            )}
          </div>
        </section>
      </section>
    </div>
  );
}
