"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ClipboardList,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  UserRound,
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
  customer_location?: string | null;
  customer_note: string | null;
  total_amount: number;
  status: string;
  payment_status?: string | null;
  created_at: string;
  updated_at?: string | null;
  order_items: DashboardOrderItem[];
};

const orderStatuses = ["started", "confirmed", "preparing", "delivered"];

export default function OrderDetailPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [order, setOrder] = useState<DashboardOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState("");

  const business = useMemo(() => {
    if (!order) return null;
    return businesses.find((item) => item.id === order.business_id) || null;
  }, [businesses, order]);

  async function loadOrder() {
    setIsLoading(true);
    setMessage("");

    try {
      const ownedBusinesses = await getMyBusinesses();
      setBusinesses(ownedBusinesses);

      let foundOrder: DashboardOrder | null = null;

      for (const item of ownedBusinesses) {
        const orders = await getOrdersWithItemsByBusinessId(item.id);
        foundOrder =
          (orders as DashboardOrder[]).find((entry) => entry.id === orderId) ||
          foundOrder;

        if (foundOrder) break;
      }

      setOrder(foundOrder);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to load order."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  async function handleUpdateStatus(status: string) {
    if (!order) return;

    setIsUpdating(true);
    setMessage("");

    try {
      await updateOrderStatus({ orderId: order.id, status });
      await loadOrder();
      setMessage("Order status updated successfully.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Unable to update order."
      );
    } finally {
      setIsUpdating(false);
    }
  }

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-[#eadfff] bg-white p-8">
          <Loader2 className="animate-spin text-[#7c3aed]" size={28} />
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <div className="grid gap-4">
        <Link
          href="/dashboard/orders"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfff] bg-white px-4 py-2 text-sm font-bold text-[#241436]"
        >
          <ArrowLeft size={16} />
          Orders
        </Link>

        <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-10 text-center">
          <ClipboardList className="mx-auto text-[#7c3aed]" size={32} />
          <h1 className="mt-4 text-xl font-black tracking-[-0.04em] text-[#241436]">
            Order not found
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 rounded-full border border-[#eadfff] bg-white px-4 py-2 text-sm font-bold text-[#241436]"
        >
          <ArrowLeft size={16} />
          Orders
        </Link>

        <div className="flex flex-wrap gap-2">
          {business?.whatsapp && order.customer_phone ? (
            <a
              href={buildWhatsAppLink(
                order.customer_phone,
                `Hello, this is ${business.name}. We are following up on your order.`
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#241436] px-4 py-2 text-sm font-bold text-white"
            >
              <MessageCircle size={16} />
              Follow Up
            </a>
          ) : null}
        </div>
      </section>

      <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Order #{order.id.slice(0, 8)}
            </p>
            <h1 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#241436]">
              {order.customer_name || "Customer"}
            </h1>
          </div>

          <div className="text-right">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
              Total
            </p>
            <p className="mt-1 text-2xl font-black tracking-[-0.04em] text-[#dc2626]">
              {formatCurrency(Number(order.total_amount || 0))}
            </p>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1fr_22rem]">
        <div className="grid gap-4">
          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">
              Items ordered
            </h2>

            <div className="mt-4 grid gap-2">
              {order.order_items.length === 0 ? (
                <div className="rounded-2xl bg-[#faf8ff] p-4 text-sm font-semibold text-[#6f6580]">
                  No order items found.
                </div>
              ) : null}

              {order.order_items.map((item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-black text-[#241436]">
                      {item.product_name}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-[#6f6580]">
                      {formatCurrency(Number(item.unit_price || 0))} ×{" "}
                      {item.quantity}
                    </p>
                  </div>

                  <p className="font-black text-[#241436]">
                    {formatCurrency(Number(item.line_total || 0))}
                  </p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">
              Timeline
            </h2>

            <div className="mt-4 grid gap-3">
              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-4">
                <CalendarClock className="shrink-0 text-[#7c3aed]" size={18} />
                <div>
                  <p className="text-sm font-black text-[#241436]">
                    Order created
                  </p>
                  <p className="mt-1 text-sm text-[#6f6580]">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-4">
                <ClipboardList className="shrink-0 text-[#7c3aed]" size={18} />
                <div>
                  <p className="text-sm font-black text-[#241436]">
                    Current status
                  </p>
                  <p className="mt-1 text-sm capitalize text-[#6f6580]">
                    {order.status}
                  </p>
                </div>
              </div>
            </div>
          </article>
        </div>

        <aside className="grid gap-4">
          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">
              Customer details
            </h2>

            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-3">
                <UserRound className="text-[#7c3aed]" size={18} />
                <span className="font-semibold text-[#241436]">
                  {order.customer_name || "Customer"}
                </span>
              </div>

              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-3">
                <Phone className="text-[#7c3aed]" size={18} />
                <span className="font-semibold text-[#241436]">
                  {order.customer_phone || "No phone"}
                </span>
              </div>

              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-3">
                <MapPin className="text-[#7c3aed]" size={18} />
                <span className="font-semibold text-[#241436]">
                  {order.customer_location ||
                    order.customer_address ||
                    "No delivery details"}
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">
              Status
            </h2>

            <div className="mt-4 grid gap-2">
              {orderStatuses.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => handleUpdateStatus(status)}
                  disabled={isUpdating}
                  className={`min-h-11 rounded-full px-4 text-sm font-bold capitalize transition disabled:opacity-60 ${
                    order.status === status
                      ? "bg-[#7c3aed] text-white"
                      : "border border-[#eadfff] bg-white text-[#241436] hover:bg-[#faf8ff]"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            <div className="mt-4 rounded-2xl bg-amber-50 p-3 text-sm font-bold capitalize text-amber-700">
              Payment: {order.payment_status || "pending"}
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">Notes</h2>
            <p className="mt-3 rounded-2xl bg-[#faf8ff] p-4 text-sm leading-6 text-[#6f6580]">
              {order.customer_note || "No notes."}
            </p>
          </article>
        </aside>
      </section>
    </div>
  );
}
