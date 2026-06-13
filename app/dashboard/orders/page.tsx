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
  Store,
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
    const search = query.toLowerCase();

    return orders.filter((order) => {
      return (
        (order.customer_name || "").toLowerCase().includes(search) ||
        (order.customer_phone || "").toLowerCase().includes(search) ||
        (order.customer_address || "").toLowerCase().includes(search) ||
        order.status.toLowerCase().includes(search) ||
        order.order_items.some((item) =>
          item.product_name.toLowerCase().includes(search)
        )
      );
    });
  }, [orders, query]);

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.total_amount || 0),
    0
  );

  const pendingOrders = orders.filter(
    (order) => order.status === "started" || order.status === "confirmed"
  ).length;

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <Loader2 className="mx-auto animate-spin text-slate-950" size={28} />
          <p className="mt-4 text-sm text-slate-500">Loading orders...</p>
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-8 text-center">
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-amber-950">
          Create your business page first
        </h2>

        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-amber-900">
          Orders will appear here after your business page is created and
          customers start placing orders.
        </p>

        <Link
          href="/dashboard/onboarding"
          className="mt-6 inline-flex rounded-full bg-amber-300 px-6 py-4 text-sm font-semibold text-amber-950 hover:bg-amber-200"
        >
          Start Onboarding
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8">
      <section className="rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 p-7 text-white shadow-soft">
        <div className="grid items-end gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-200">
              Orders
            </p>

            <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-[-0.05em]">
              Track customer orders and follow up faster.
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Orders from your business page appear here with customer details,
              ordered items, total amount, status, and quick WhatsApp follow-up.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/10 p-5 backdrop-blur-xl">
            <div className="flex items-center justify-between rounded-2xl bg-white p-4 text-slate-950">
              <div>
                <p className="text-sm font-semibold">Total Orders</p>
                <p className="text-xs text-slate-500">For selected business</p>
              </div>

              <span className="text-2xl font-semibold">{orders.length}</span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-white/10 p-4">
              <div>
                <p className="text-sm font-semibold">Revenue Tracked</p>
                <p className="text-xs text-slate-300">
                  Based on saved orders
                </p>
              </div>

              <span className="text-lg font-semibold">
                {formatCurrency(totalRevenue)}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Active Business
            </p>

            <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-slate-950">
              Choose which business orders to view
            </h3>
          </div>

          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-4 text-sm outline-none focus:border-slate-950 md:min-w-80"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} â€” /store/{business.slug}
              </option>
            ))}
          </select>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl bg-white p-4 text-sm text-slate-700 shadow-sm">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
            <ClipboardList size={20} />
          </span>

          <p className="text-sm text-slate-500">Orders</p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            {orders.length}
          </p>

          <p className="mt-1 text-xs text-slate-400">All saved orders</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-amber-50 text-amber-700">
            <Clock3 size={20} />
          </span>

          <p className="text-sm text-slate-500">Pending</p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            {pendingOrders}
          </p>

          <p className="mt-1 text-xs text-slate-400">Needs follow-up</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 size={20} />
          </span>

          <p className="text-sm text-slate-500">Completed</p>

          <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-slate-950">
            {orders.filter((order) => order.status === "delivered").length}
          </p>

          <p className="mt-1 text-xs text-slate-400">Delivered orders</p>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-slate-100 text-slate-800">
            <Store size={20} />
          </span>

          <p className="text-sm text-slate-500">Revenue</p>

          <p className="mt-2 text-2xl font-semibold tracking-[-0.05em] text-slate-950">
            {formatCurrency(totalRevenue)}
          </p>

          <p className="mt-1 text-xs text-slate-400">Tracked value</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">
              Order List
            </p>

            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
              Customer orders
            </h3>
          </div>

          <div className="relative md:w-80">
            <Search
              size={17}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-11 py-3 text-sm outline-none focus:border-slate-950"
              placeholder="Search orders"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredOrders.length === 0 ? (
            <div className="rounded-[2rem] bg-slate-50 p-10 text-center">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-500">
                <ClipboardList size={24} />
              </div>

              <h4 className="text-lg font-semibold text-slate-950">
                No orders yet
              </h4>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Once customers place orders from your business page, saved
                orders will appear here.
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
                className="rounded-[1.75rem] border border-slate-200 p-5"
              >
                <div className="grid gap-6 xl:grid-cols-[1fr_18rem] xl:items-start">
                  <div>
                    <div className="mb-3 flex flex-wrap gap-2">
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

                    <h4 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                      {order.customer_name || "Customer"}
                    </h4>

                    <p className="mt-2 text-sm text-slate-500">
                      {order.customer_phone || "No phone added"}
                    </p>

                    {order.customer_address ? (
                      <p className="mt-2 text-sm text-slate-500">
                        {order.customer_address}
                      </p>
                    ) : null}

                    {order.customer_note ? (
                      <p className="mt-3 max-w-2xl rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                        {order.customer_note}
                      </p>
                    ) : null}

                    <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Ordered Items
                      </p>

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
                                {formatCurrency(Number(item.unit_price || 0))} Ã—{" "}
                                {item.quantity}
                              </p>
                            </div>

                            <p className="font-semibold text-slate-950">
                              {formatCurrency(Number(item.line_total || 0))}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Total
                      </p>

                      <p className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                        {formatCurrency(Number(order.total_amount || 0))}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                        Update Status
                      </p>

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
                              className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                                isActive
                                  ? "bg-slate-950 text-white"
                                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-950 hover:text-white"
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
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
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
        </div>
      </section>
    </div>
  );
}
