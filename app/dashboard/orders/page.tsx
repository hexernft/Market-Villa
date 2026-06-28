"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Clock3,
  ClipboardList,
  Loader2,
  MessageCircle,
  PackageCheck,
  Search,
  Truck,
} from "lucide-react";
import {
  getMyBusinesses,
  getOrdersWithItemsByBusinessId,
  updateOrderStatus,
} from "@/lib/business-actions";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string | null;
};

type DashboardOrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_note: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: DashboardOrderItem[];
};

const orderStatuses = [
  {
    label: "Started",
    value: "started",
    icon: Clock3,
  },
  {
    label: "Confirmed",
    value: "confirmed",
    icon: CheckCircle2,
  },
  {
    label: "Preparing",
    value: "preparing",
    icon: PackageCheck,
  },
  {
    label: "Delivered",
    value: "delivered",
    icon: Truck,
  },
];

export default function OrdersPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const [message, setMessage] = useState("");

  const selectedBusiness = useMemo(() => {
    return businesses.find((business) => business.id === selectedBusinessId);
  }, [businesses, selectedBusinessId]);

  async function loadOrders(businessId: string) {
    const items = await getOrdersWithItemsByBusinessId(businessId);
    setOrders(items);
  }

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
          error instanceof Error ? error.message : "Unable to load orders.";
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

    async function loadSelectedOrders() {
      if (!selectedBusinessId) {
        setOrders([]);
        return;
      }

      try {
        const items = await getOrdersWithItemsByBusinessId(selectedBusinessId);

        if (!mounted) return;

        setOrders(items);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unable to load orders.";
        setMessage(errorMessage);
      }
    }

    loadSelectedOrders();

    return () => {
      mounted = false;
    };
  }, [selectedBusinessId]);

  async function handleUpdateStatus(orderId: string, status: string) {
    if (!selectedBusinessId) return;

    setUpdatingOrderId(orderId);
    setMessage("");

    try {
      await updateOrderStatus({
        orderId,
        status,
      });

      await loadOrders(selectedBusinessId);
      setMessage("Order status updated successfully.");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unable to update order.";
      setMessage(errorMessage);
    } finally {
      setUpdatingOrderId("");
    }
  }

  const filteredOrders = useMemo(() => {
    const search = query.toLowerCase().trim();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" || order.status === statusFilter;
      const matchesSearch =
        !search ||
        (order.customer_name || "").toLowerCase().includes(search) ||
        (order.customer_phone || "").toLowerCase().includes(search) ||
        (order.customer_address || "").toLowerCase().includes(search) ||
        order.status.toLowerCase().includes(search) ||
        order.order_items.some((item) =>
          item.product_name.toLowerCase().includes(search)
        );

      return matchesStatus && matchesSearch;
    });
  }, [orders, query, statusFilter]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "started" || order.status === "confirmed"
  ).length;

  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-purple-200 bg-purple-50 p-8 text-center">
        <p className="text-2xl font-semibold tracking-[-0.04em] text-purple-950">
          Create your business page first
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex rounded-full bg-purple-300 px-4 py-2.5 text-sm font-semibold text-purple-950 transition hover:-translate-y-0.5 hover:bg-purple-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-[1.8rem] font-black tracking-[-0.05em] text-[#171421]">
            Orders
          </h1>
        </div>

        <Link
          href="/dashboard/products"
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
          aria-label="Add product"
        >
          <PackageCheck size={24} />
        </Link>
      </section>

      <section className="rounded-2xl border border-[#ebe7f3] bg-white p-3">
        <div className="grid gap-5 xl:grid-cols-[1fr_auto] xl:items-center">
          <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
            <select
              value={selectedBusinessId}
              onChange={(event) => setSelectedBusinessId(event.target.value)}
              className="min-h-11 rounded-2xl border border-[#ebe7f3] bg-[#fcfbff] px-4 text-sm font-semibold text-[#241436] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 md:min-w-80"
            >
              {businesses.map((business) => (
                <option key={business.id} value={business.id}>
                  {business.name} — /store/{business.slug}
                </option>
              ))}
            </select>

            <div className="relative md:w-80">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="min-h-11 w-full rounded-2xl border border-[#ebe7f3] bg-white px-11 text-sm outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
                placeholder="Search orders"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2">
            <div className="rounded-2xl bg-[#fcfbff] px-3 py-2.5">
              <p className="text-xs text-slate-500">All</p>
              <p className="mt-1 text-xl font-semibold text-slate-950">
                {orders.length}
              </p>
            </div>

            <div className="rounded-2xl bg-[#f1eaff] px-3 py-2.5">
              <p className="text-xs text-purple-700">Pending</p>
              <p className="mt-1 text-xl font-semibold text-purple-950">
                {pendingOrders}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-3 py-2.5">
              <p className="text-xs text-emerald-700">Delivered</p>
              <p className="mt-1 text-xl font-semibold text-emerald-950">
                {deliveredOrders}
              </p>
            </div>

            <div className="rounded-2xl bg-[#241436] px-3 py-2.5">
              <p className="text-xs text-slate-300">Revenue</p>
              <p className="mt-1 text-sm font-semibold text-white md:text-sm">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex gap-2 overflow-x-auto pb-1">
        {[
          { label: "All", value: "all" },
          { label: "Started", value: "started" },
          { label: "Confirmed", value: "confirmed" },
          { label: "Delivered", value: "delivered" },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setStatusFilter(item.value)}
            className={`min-h-11 shrink-0 rounded-2xl px-5 text-sm font-bold transition ${
              statusFilter === item.value
                ? "bg-[#7c3aed] text-white"
                : "border border-[#ebe7f3] bg-white text-[#241436]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#ebe7f3] bg-white p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-[#ebe7f3] bg-white p-10 text-center">
            <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <ClipboardList size={28} />
            </div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-[#171421]">
              No orders yet
            </h2>
            <p className="mx-auto mt-3 max-w-sm text-sm font-semibold leading-6 text-slate-500">
              Share your store link to start receiving customer orders.
            </p>
          </div>
        ) : null}

        {filteredOrders.map((order) => {
          const StatusIcon =
            orderStatuses.find((status) => status.value === order.status)
              ?.icon || Clock3;

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-[#ebe7f3] bg-white p-4 transition hover:bg-[#faf7ff] md:p-5"
            >
              <div className="grid gap-6 xl:grid-cols-[1fr_18rem] xl:items-start">
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      <StatusIcon size={14} />
                      {order.status}
                    </span>

                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>

                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {order.order_items.length} item
                      {order.order_items.length === 1 ? "" : "s"}
                    </span>
                  </div>

                  <div className="grid gap-1">
                    <p className="text-xl font-black tracking-[-0.03em] text-[#171421]">
                      {order.customer_name || "Customer"}
                    </p>

                    <p className="text-sm text-slate-500">
                      {order.customer_phone || "No phone added"}
                    </p>

                    {order.customer_address ? (
                      <p className="text-sm text-slate-500">
                        {order.customer_address}
                      </p>
                    ) : null}
                  </div>

                  {order.customer_note ? (
                    <p className="mt-4 max-w-2xl rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                      {order.customer_note}
                    </p>
                  ) : null}

                  <div className="mt-5 rounded-2xl bg-[#fcfbff] p-3">
                    <div className="grid gap-2">
                      {order.order_items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-4 rounded-2xl bg-white p-3 text-sm"
                        >
                          <div>
                            <p className="font-semibold text-slate-950">
                              {item.product_name}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatCurrency(Number(item.unit_price || 0))} ×{" "}
                              {item.quantity}
                            </p>
                          </div>

                          <p className="whitespace-nowrap font-semibold text-slate-950">
                            {formatCurrency(Number(item.line_total || 0))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl bg-[#fcfbff] p-4">

                    <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#171421]">
                      {formatCurrency(Number(order.total_amount || 0))}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#fcfbff] p-3">
                    <div className="grid gap-2">
                      {orderStatuses.map((status) => {
                        const Icon = status.icon;
                        const isActive = status.value === order.status;

                        return (
                          <button
                            key={status.value}
                            type="button"
                            onClick={() =>
                              handleUpdateStatus(order.id, status.value)
                            }
                            disabled={updatingOrderId === order.id}
                            className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold transition ${
                              isActive
                                ? "bg-[#7c3aed] text-white"
                                : "bg-white text-slate-700 ring-1 ring-[#ebe7f3] hover:bg-[#f1eaff] hover:text-[#241436]"
                            } disabled:opacity-60`}
                          >
                            {updatingOrderId === order.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Icon size={14} />
                            )}

                            {status.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {order.customer_phone ? (
                    <a
                      href={buildWhatsAppLink(
                        order.customer_phone,
                        `Hello, this is ${selectedBusiness?.name}. We are following up on your order.`
                      )}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-[#241436] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#351b55]"
                    >
                      <MessageCircle size={17} />
                      Follow Up
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}


