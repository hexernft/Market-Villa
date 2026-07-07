"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  ClipboardList,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import {
  getMyBusinesses,
  getOrdersWithItemsByBusinessId,
} from "@/lib/business-actions";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
  whatsapp: string | null;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email?: string | null;
  customer_note: string | null;
  total_amount: number;
  status: string;
  payment_status?: string | null;
  created_at: string;
};

function getCustomerKey(order: DashboardOrder) {
  const identity =
    order.customer_phone?.trim() ||
    order.customer_email?.trim() ||
    order.customer_name?.trim() ||
    order.id;

  return identity.toLowerCase();
}

export default function CustomerDetailPage() {
  const params = useParams<{ customerKey: string }>();
  const customerKey = decodeURIComponent(params.customerKey);
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadCustomerOrders() {
      try {
        setIsLoading(true);
        const ownedBusinesses = await getMyBusinesses();
        const allOrders: DashboardOrder[] = [];

        for (const business of ownedBusinesses) {
          const items = await getOrdersWithItemsByBusinessId(business.id);
          allOrders.push(...(items as DashboardOrder[]));
        }

        if (!mounted) return;

        setBusinesses(ownedBusinesses);
        setOrders(
          allOrders
            .filter((order) => getCustomerKey(order) === customerKey)
            .sort((a, b) => b.created_at.localeCompare(a.created_at))
        );
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load customer."
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadCustomerOrders();

    return () => {
      mounted = false;
    };
  }, [customerKey]);

  const customer = useMemo(() => {
    const firstOrder = orders[0];

    if (!firstOrder) return null;

    return {
      name: firstOrder.customer_name || "Customer",
      phone: firstOrder.customer_phone || "",
      email: firstOrder.customer_email || "",
      totalOrders: orders.length,
      totalSpent: orders.reduce(
        (sum, order) => sum + Number(order.total_amount || 0),
        0
      ),
      lastOrderDate: firstOrder.created_at,
      notes: orders
        .map((order) => order.customer_note)
        .filter(Boolean)
        .slice(0, 3),
    };
  }, [orders]);

  const firstBusiness = useMemo(() => {
    const businessId = orders[0]?.business_id;
    return businesses.find((business) => business.id === businessId) || null;
  }, [businesses, orders]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-[#eadfff] bg-white p-8">
          <Loader2 className="animate-spin text-[#7c3aed]" size={28} />
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <div className="grid gap-4">
        <Link
          href="/dashboard/customers"
          className="inline-flex w-fit items-center gap-2 rounded-full border border-[#eadfff] bg-white px-4 py-2 text-sm font-bold text-[#241436]"
        >
          <ArrowLeft size={16} />
          Customers
        </Link>

        <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-10 text-center">
          <UserRound className="mx-auto text-[#7c3aed]" size={32} />
          <h1 className="mt-4 text-xl font-black tracking-[-0.04em] text-[#241436]">
            Customer not found
          </h1>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <section className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-2 rounded-full border border-[#eadfff] bg-white px-4 py-2 text-sm font-bold text-[#241436]"
        >
          <ArrowLeft size={16} />
          Customers
        </Link>

        {firstBusiness?.whatsapp && customer.phone ? (
          <a
            href={buildWhatsAppLink(
              customer.phone,
              `Hello, this is ${firstBusiness.name}.`
            )}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#241436] px-4 py-2 text-sm font-bold text-white"
          >
            <MessageCircle size={16} />
            Message
          </a>
        ) : null}
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[22rem_1fr]">
        <aside className="grid gap-4">
          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
              <UserRound size={26} />
            </div>

            <h1 className="mt-4 text-2xl font-black tracking-[-0.05em] text-[#241436]">
              {customer.name}
            </h1>

            <div className="mt-5 grid gap-3 text-sm">
              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-3">
                <Phone className="text-[#7c3aed]" size={18} />
                <span className="font-semibold text-[#241436]">
                  {customer.phone || "No phone"}
                </span>
              </div>

              <div className="flex gap-3 rounded-2xl bg-[#faf8ff] p-3">
                <Mail className="text-[#7c3aed]" size={18} />
                <span className="font-semibold text-[#241436]">
                  {customer.email || "No email"}
                </span>
              </div>
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">Summary</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-[#faf8ff] p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                  Orders
                </p>
                <p className="mt-1 text-2xl font-black text-[#241436]">
                  {customer.totalOrders}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf8ff] p-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                  Spent
                </p>
                <p className="mt-1 text-lg font-black text-[#dc2626]">
                  {formatCurrency(customer.totalSpent)}
                </p>
              </div>
            </div>
          </article>

          <article className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
            <h2 className="text-base font-black text-[#241436]">Notes</h2>
            <div className="mt-4 grid gap-2">
              {customer.notes.length === 0 ? (
                <p className="rounded-2xl bg-[#faf8ff] p-4 text-sm text-[#6f6580]">
                  No notes yet.
                </p>
              ) : null}

              {customer.notes.map((note, index) => (
                <p
                  key={`${note}-${index}`}
                  className="rounded-2xl bg-[#faf8ff] p-4 text-sm leading-6 text-[#6f6580]"
                >
                  {note}
                </p>
              ))}
            </div>
          </article>
        </aside>

        <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-5">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-[#7c3aed]" size={20} />
            <h2 className="text-base font-black text-[#241436]">
              Order history
            </h2>
          </div>

          <div className="mt-4 grid gap-3">
            {orders.length === 0 ? (
              <div className="rounded-2xl bg-[#faf8ff] p-8 text-center">
                <ClipboardList className="mx-auto text-[#7c3aed]" size={28} />
                <p className="mt-3 text-sm font-bold text-[#241436]">
                  No orders yet.
                </p>
              </div>
            ) : null}

            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="grid gap-3 rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-4 transition hover:-translate-y-0.5 hover:border-[#7c3aed] sm:grid-cols-[1fr_auto] sm:items-center"
              >
                <div>
                  <p className="text-sm font-black text-[#241436]">
                    Order #{order.id.slice(0, 8)}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold capitalize text-[#6f6580]">
                      {order.status}
                    </span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold capitalize text-amber-700">
                      {order.payment_status || "pending"}
                    </span>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-[#6f6580]">
                      {new Date(order.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <p className="font-black text-[#dc2626]">
                  {formatCurrency(Number(order.total_amount || 0))}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
}
