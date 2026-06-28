"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CalendarDays,
  Car,
  Home,
  Loader2,
  MessageCircle,
  Phone,
} from "lucide-react";
import {
  getMyBusinesses,
  getPropertyInquiriesByBusinessId,
  getVehicleInquiriesByBusinessId,
  updatePropertyInquiryStatus,
  updateVehicleInquiryStatus,
} from "@/lib/business-actions";
import { getBusinessModeMeta, normalizeBusinessMode } from "@/lib/business-modes";
import { normalizePlanId } from "@/lib/plans";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
subscription_plan?: string | null;
};

type Lead = {
  id: string;
  business_id: string;
  product_id?: string | null;
  kind: "vehicle" | "property";
  itemName: string;
  customerName: string;
  customerPhone: string;
  preferredDate?: string | null;
  preferredLocation?: string | null;
  inquiryType: string;
  message?: string | null;
  status: string;
  createdAt?: string | null;
};

const vehicleStatuses = ["new", "contacted", "scheduled", "closed"];
const propertyStatuses = ["new", "contacted", "scheduled", "closed"];

function formatDate(value?: string | null) {
  if (!value) return "No date";

  return new Intl.DateTimeFormat("en-NG", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "closed") return "bg-slate-100 text-slate-700";
  if (status === "scheduled") return "bg-blue-50 text-blue-700";
  if (status === "contacted") return "bg-purple-50 text-purple-700";

  return "bg-emerald-50 text-emerald-700";
}

export default function LeadsPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingLeads, setIsLoadingLeads] = useState(false);
  const [updatingLeadId, setUpdatingLeadId] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  const selectedMode = normalizeBusinessMode("products");
  const modeMeta = getBusinessModeMeta("products");
  const isPro = normalizePlanId(selectedBusiness?.subscription_plan) === "pro";
  const relevantLeads = leads.filter((lead) => lead.kind !== "vehicle" && lead.kind !== "property");

  async function loadBusinesses() {
    const items = await getMyBusinesses();
    setBusinesses(items);

    if (items.length) {
      setSelectedBusinessId((current) => current || items[0].id);
    }
  }

  async function loadLeads(businessId: string) {
    setIsLoadingLeads(true);
    setMessage("");

    try {
      const [vehicleItems, propertyItems] = await Promise.all([
        getVehicleInquiriesByBusinessId(businessId),
        getPropertyInquiriesByBusinessId(businessId),
      ]);

      const mappedVehicleLeads: Lead[] = vehicleItems.map((item: any) => ({
        id: item.id,
        business_id: item.business_id,
        product_id: item.product_id,
        kind: "vehicle",
        itemName: item.vehicle_name || "Vehicle inquiry",
        customerName: item.customer_name || "Customer",
        customerPhone: item.customer_phone || "",
        preferredDate: item.preferred_date,
        preferredLocation: item.preferred_location,
        inquiryType: item.inquiry_type || "inspection",
        message: item.message,
        status: item.status || "new",
        createdAt: item.created_at,
      }));

      const mappedPropertyLeads: Lead[] = propertyItems.map((item: any) => ({
        id: item.id,
        business_id: item.business_id,
        product_id: item.product_id,
        kind: "property",
        itemName: item.property_name || "Property inquiry",
        customerName: item.customer_name || "Customer",
        customerPhone: item.customer_phone || "",
        preferredDate: item.preferred_date,
        preferredLocation: item.preferred_location,
        inquiryType: item.inquiry_type || "inspection",
        message: item.message,
        status: item.status || "new",
        createdAt: item.created_at,
      }));

      setLeads(
        [...mappedVehicleLeads, ...mappedPropertyLeads].sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to load leads.";
      setMessage(errorMessage);
    } finally {
      setIsLoadingLeads(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    async function loadPage() {
      try {
        setIsLoading(true);
        await loadBusinesses();
      } catch (error) {
        if (!mounted) return;
        setMessage(
          error instanceof Error ? error.message : "Unable to load businesses."
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadPage();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedBusinessId) {
      setLeads([]);
      return;
    }

    loadLeads(selectedBusinessId);
  }, [selectedBusinessId]);

  async function handleStatusChange(lead: Lead, status: string) {
    setUpdatingLeadId(lead.id);
    setMessage("");

    try {
      if (lead.kind === "vehicle") {
        await updateVehicleInquiryStatus({ inquiryId: lead.id, status });
      } else {
        await updatePropertyInquiryStatus({ inquiryId: lead.id, status });
      }

      await loadLeads(lead.business_id);
      setMessage("Lead status updated.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update lead."
      );
    } finally {
      setUpdatingLeadId("");
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[55vh] place-items-center">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={24} />
        </div>
      </main>
    );
  }

  if (!businesses.length) {
    return (
      <section className="rounded-[1.5rem] border border-purple-200 bg-purple-50 p-6 text-center">
        <p className="text-xl font-semibold tracking-[-0.04em] text-purple-950">
          Create your business page first
        </p>
        <Link
          href="/dashboard/onboarding"
          className="mt-5 inline-flex rounded-full bg-purple-300 px-5 py-2.5 text-sm font-semibold text-purple-950"
        >
          Start Onboarding
        </Link>
      </section>
    );
  }

  return (
    <div className="grid gap-5">
      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Inspection and inquiry tracker
            </h1>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="min-h-10 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-800 outline-none focus:border-[var(--mv-violet)] md:min-w-72"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} - /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {!isPro && selectedMode !== "products" ? (
        <section className="rounded-[1.35rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm font-semibold text-amber-950">
            {modeMeta.label} leads require Premium.
          </p>
          <p className="mt-2 text-sm leading-6 text-amber-900">
            Upgrade to Premium to keep this business in {modeMeta.label} mode
            and track its leads here.
          </p>
          <Link
            href="/dashboard/billing"
            className="mt-4 inline-flex min-h-10 items-center justify-center rounded-full bg-[#26143d] px-5 text-sm font-semibold text-white"
          >
            View Premium
          </Link>
        </section>
      ) : null}

      {message ? (
        <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-3 md:grid-cols-3">
        {[
          ["Total leads", relevantLeads.length],
          ["New", relevantLeads.filter((lead) => lead.status === "new").length],
          [
            "Scheduled",
            relevantLeads.filter((lead) => lead.status === "scheduled").length,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-[1.25rem] border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
              {value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-4">
        {isLoadingLeads ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            Loading lead activity...
          </div>
        ) : null}

        {!isLoadingLeads && relevantLeads.length === 0 ? (
          <div className="rounded-[1.5rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
            <MessageCircle className="mx-auto text-slate-400" size={28} />
          </div>
        ) : null}

        {relevantLeads.map((lead) => {
          const statuses =
            lead.kind === "vehicle" ? vehicleStatuses : propertyStatuses;
          const Icon = lead.kind === "vehicle" ? Car : Home;

          return (
            <article
              key={`${lead.kind}-${lead.id}`}
              className="rounded-[1.35rem] border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
                <div>
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      <Icon size={13} />
                      {lead.kind === "vehicle" ? "Vehicle" : "Property"}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusClass(
                        lead.status
                      )}`}
                    >
                      {lead.status}
                    </span>
                    <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-700">
                      {lead.inquiryType.replace(/_/g, " ")}
                    </span>
                  </div>

                  <h2 className="text-lg font-semibold tracking-[-0.04em] text-slate-950">
                    {lead.itemName}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    {lead.customerName}
                    {lead.customerPhone ? ` - ${lead.customerPhone}` : ""}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-3 py-1">
                      <CalendarDays size={13} />
                      {lead.preferredDate || formatDate(lead.createdAt)}
                    </span>
                    {lead.preferredLocation ? (
                      <span className="rounded-full bg-slate-50 px-3 py-1">
                        {lead.preferredLocation}
                      </span>
                    ) : null}
                  </div>

                  {lead.message ? (
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                      {lead.message}
                    </p>
                  ) : null}
                </div>

                <div className="grid gap-2 sm:grid-cols-[auto_auto] lg:grid-cols-1">
                  {lead.customerPhone ? (
                    <a
                      href={`tel:${lead.customerPhone}`}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-sm font-semibold text-white"
                    >
                      <Phone size={16} />
                      Call
                    </a>
                  ) : null}

                  <select
                    value={lead.status}
                    disabled={updatingLeadId === lead.id}
                    onChange={(event) =>
                      handleStatusChange(lead, event.target.value)
                    }
                    className="min-h-10 rounded-full border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[var(--mv-violet)]"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

