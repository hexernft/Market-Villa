import Image from "next/image";
import Link from "next/link";
import {
  Store, ArrowLeft, BookOpen, CheckCircle2, HelpCircle } from "lucide-react";
import { BRAND } from "@/lib/brand";

const guides = [
  {
    title: "Create your business page",
    steps: [
      "Sign up or log in to Market Villa.",
      "Open Onboarding from the dashboard.",
      "Add business name, category, contact details, and location.",
      "Choose a starting style and publish your page.",
    ],
  },
  {
    title: "Add products",
    steps: [
      "Open Products from the dashboard.",
      "Add product name, price, category, and description.",
      "Upload a product image or paste an image URL.",
      "Save the product and preview your public store.",
    ],
  },
  {
    title: "Manage orders",
    steps: [
      "Customers add products to cart from your public store.",
      "They enter their contact details and send the order to WhatsApp.",
      "The order is saved in your dashboard.",
      "Update order status as started, confirmed, preparing, or delivered.",
    ],
  },
  {
    title: "Request a custom domain",
    steps: [
      "Open Custom Domain from the dashboard.",
      "Enter your preferred domain and an alternative option.",
      "Submit the request for Market Villa review.",
      "Market Villa will guide you through payment and setup.",
    ],
  },
];

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 md:px-5">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Market Villa
        </Link>

        <section className="rounded-[2rem] bg-[#26143d] p-8 text-white shadow-soft md:p-10">
          <div className="mb-8 grid h-11 w-14 place-items-center rounded-2xl bg-white text-slate-950">
            <BookOpen size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            Help Center
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em] md:text-2xl">
            Learn how to use {BRAND.name}.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            Quick guides for setting up a business page, managing products,
            handling orders, and requesting custom domains.
          </p>
        </section>

        <section className="mt-6 grid gap-5 md:grid-cols-2">
          {guides.map((guide) => (
            <article
              key={guide.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-teal-50 text-teal-700">
                  <HelpCircle size={20} />
                </span>
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {guide.title}
                </h2>
              </div>

              <div className="grid gap-3">
                {guide.steps.map((step) => (
                  <div key={step} className="flex gap-3">
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
                    <p className="text-sm leading-6 text-slate-600">{step}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Still need help?
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Contact Market Villa support for setup, billing, or domain help.
              </p>
            </div>

            <a
              href={`mailto:${BRAND.supportEmail}`}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#241436] to-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_32px_rgba(2,8,31,0.25)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(2,8,31,0.32)]"
            >
              <Store size={17} />
              Contact Support
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}



