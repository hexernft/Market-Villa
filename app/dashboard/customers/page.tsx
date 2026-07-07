"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2, Search, ShoppingBag, UserRound, UsersRound } from "lucide-react";
import {
  getMyBusinesses,
  getOrdersWithItemsByBusinessId,
} from "@/lib/business-actions";
import { formatCurrency } from "@/lib/utils";

type DashboardBusiness = {
  id: string;
  name: string;
  slug: string;
};

type DashboardOrder = {
  id: string;
  business_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email?: string | null;
  total_amount: number;
  created_at: string;
};

type CustomerSummary = {
  key: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
};

function getCustomerKey(order: DashboardOrder) {
  const identity =
    order.customer_phone?.trim() ||
    order.customer_email?.trim() ||
    order.customer_name?.trim() ||
    order.id;

  return identity.toLowerCase();
}

function buildCustomerSummaries(orders: DashboardOrder[]) {
  const grouped = new Map<string, CustomerSummary>();

  orders.forEach((order) => {
    const key = getCustomerKey(order);
    const current = grouped.get(key);
    const orderDate = order.created_at || "";

    if (!current) {
      grouped.set(key, {
        key,
        name: order.customer_name || "Customer",
        phone: order.customer_phone || "",
        email: order.customer_email || "",
        totalOrders: 1,
        totalSpent: Number(order.total_amount || 0),
        lastOrderDate: orderDate,
      });
      return;
    }

    current.totalOrders += 1;
    current.totalSpent += Number(order.total_amount || 0);

    if (orderDate && (!current.lastOrderDate || orderDate > current.lastOrderDate)) {
      current.lastOrderDate = orderDate;
    }
  });

  return Array.from(grouped.values()).sort((a, b) =>
    b.lastOrderDate.localeCompare(a.lastOrderDate)
  );
}

export default function CustomersPage() {
  const [businesses, setBusinesses] = useState<DashboardBusiness[]>([]);
  const [selectedBusinessId, setSelectedBusinessId] = useState("");
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadBusinesses() {
      try {
        setIsLoading(true);
        const items = await getMyBusinesses();

        if (!mounted) return;

        setBusinesses(items);
        setSelectedBusinessId(items[0]?.id || "");
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load customers."
        );
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadBusinesses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadOrders() {
      if (!selectedBusinessId) {
        setOrders([]);
        return;
      }

      try {
        const items = await getOrdersWithItemsByBusinessId(selectedBusinessId);

        if (!mounted) return;

        setOrders(items);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Unable to load customers."
        );
      }
    }

    loadOrders();

    return () => {
      mounted = false;
    };
  }, [selectedBusinessId]);

  const customers = useMemo(() => buildCustomerSummaries(orders), [orders]);

  const filteredCustomers = useMemo(() => {
    const search = query.toLowerCase().trim();

    if (!search) return customers;

    return customers.filter((customer) => {
      return (
        customer.name.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search)
      );
    });
  }, [customers, query]);

  if (isLoading) {
    return (
      <main className="grid min-h-[60vh] place-items-center">
        <div className="rounded-[2rem] border border-[#eadfff] bg-white p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-[#7c3aed]" size={28} />
        </div>
      </main>
    );
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-[2rem] border border-purple-200 bg-purple-50 p-8 text-center">
        <h1 className="text-2xl font-black tracking-[-0.04em] text-purple-950">
          Create your business page first
        </h1>

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
            Customers
          </h1>
        </div>

        <Link
          href="/dashboard/orders"
          className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-r from-[#241436] to-[#7c3aed] text-white transition hover:bg-[#351b55]"
          aria-label="View orders"
        >
          <ShoppingBag size={22} />
        </Link>
      </section>

      <section className="rounded-[1.35rem] border border-[#eadfff] bg-white p-3">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <select
            value={selectedBusinessId}
            onChange={(event) => setSelectedBusinessId(event.target.value)}
            className="min-h-12 rounded-2xl border border-[#eadfff] bg-[#faf8ff] px-4 text-sm font-bold text-[#241436] outline-none transition focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10 md:min-w-80"
          >
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} - /store/{business.slug}
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
              className="min-h-12 w-full rounded-2xl border border-[#eadfff] bg-white px-11 text-sm font-semibold outline-none transition focus:border-[#7c3aed] focus:bg-white focus:ring-4 focus:ring-[#7c3aed]/10"
              placeholder="Search customers"
            />
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-2xl border border-[#eadfff] bg-white p-4 text-sm font-semibold text-slate-700">
          {message}
        </div>
      ) : null}

      <section className="grid gap-3">
        {filteredCustomers.length === 0 ? (
          <div className="rounded-[1.35rem] border border-[#eadfff] bg-white p-10 text-center">
            <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
              <UsersRound size={28} />
            </div>
            <h2 className="text-xl font-black tracking-[-0.04em] text-[#241436]">
              No customers yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#6f6580]">
              Customers will appear here after they place storefront orders.
            </p>
          </div>
        ) : null}

        {filteredCustomers.map((customer) => (
          <article
            key={customer.key}
            className="grid gap-4 rounded-[1.35rem] border border-[#eadfff] bg-white p-4 transition hover:bg-[#faf8ff] md:grid-cols-[1fr_auto] md:items-center md:p-5"
          >
            <div className="flex gap-4">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
                <UserRound size={22} />
              </div>

              <div>
                <h2 className="text-base font-black tracking-[-0.03em] text-[#241436]">
                  {customer.name}
                </h2>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[#6f6580]">
                  <span>{customer.phone || "No phone"}</span>
                  {customer.email ? <span>{customer.email}</span> : null}
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_auto_auto] sm:items-center">
              <div className="rounded-2xl bg-[#faf8ff] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                  Orders
                </p>
                <p className="mt-1 text-lg font-black text-[#241436]">
                  {customer.totalOrders}
                </p>
              </div>

              <div className="rounded-2xl bg-[#faf8ff] px-4 py-3">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                  Last order
                </p>
                <p className="mt-1 text-sm font-bold text-[#241436]">
                  {customer.lastOrderDate
                    ? new Date(customer.lastOrderDate).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>

              <Link
                href={`/dashboard/customers/${encodeURIComponent(customer.key)}`}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d8c8ff] bg-white px-5 text-sm font-bold text-[#241436] transition hover:-translate-y-0.5 hover:border-[#7c3aed] hover:bg-[#faf8ff]"
              >
                View customer
              </Link>
            </div>
          </article>
        ))}
      </section>

      {customers.length > 0 ? (
        <section className="rounded-[1.35rem] border border-[#eadfff] bg-[#faf8ff] p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                Customers
              </p>
              <p className="mt-1 text-2xl font-black text-[#241436]">
                {customers.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                Orders
              </p>
              <p className="mt-1 text-2xl font-black text-[#241436]">
                {orders.length}
              </p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                Revenue
              </p>
              <p className="mt-1 text-2xl font-black text-[#dc2626]">
                {formatCurrency(
                  orders.reduce(
                    (sum, order) => sum + Number(order.total_amount || 0),
                    0
                  )
                )}
              </p>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
