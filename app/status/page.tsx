import Link from "next/link";
import { ArrowLeft, CheckCircle2, Server, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

const systems = [
  "Public storefronts",
  "Business dashboard",
  "Image uploads",
  "WhatsApp checkout",
  "Secure payment checkout",
  "Subscription management",
];

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 md:px-5">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Market Villa
        </Link>

        <section className="rounded-[2rem] bg-[#26143d] p-8 text-white shadow-soft md:p-10">
          <div className="mb-8 grid h-11 w-14 place-items-center rounded-2xl bg-emerald-300 text-slate-950">
            <ShieldCheck size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            System Status
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em] md:text-2xl">
            All core systems operational.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            This page gives business owners a simple view of Market Villa
            platform availability.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
              <Server size={20} />
            </span>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                {BRAND.name} services
              </h2>
              <p className="text-sm text-slate-500">Live service overview.</p>
            </div>
          </div>

          <div className="grid gap-3">
            {systems.map((system) => (
              <div
                key={system}
                className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
              >
                <p className="text-sm font-medium text-slate-700">{system}</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 size={14} />
                  Operational
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}



