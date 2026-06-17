import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    title: "1. About Market Villa",
    body: "Market Villa is a platform that allows business owners to create mini websites for displaying products, contact information, and customer order flows.",
  },
  {
    title: "2. Business Accounts",
    body: "Business owners are responsible for keeping their account information accurate, including business name, contact details, product prices, availability, and product descriptions.",
  },
  {
    title: "3. Products and Orders",
    body: "Market Villa helps customers view business pages and submit order or inquiry details. The business owner remains responsible for confirming orders, delivery, payment collection, refunds, and customer communication.",
  },
  {
    title: "4. Subscription and Payments",
    body: "Market Villa may charge subscription fees for access to business pages, custom domains, premium features, and related services. Failure to renew or complete payment may result in temporary suspension or unpublishing of a business page.",
  },
  {
    title: "5. Custom Domains",
    body: "Custom domain setup may require extra fees. Domain availability is not guaranteed until confirmed. Businesses are responsible for renewing domains unless a managed domain package has been agreed.",
  },
  {
    title: "6. Acceptable Use",
    body: "Businesses may not use Market Villa to publish illegal, harmful, misleading, abusive, fraudulent, or unauthorized content. Market Villa may remove or suspend pages that violate platform rules.",
  },
  {
    title: "7. Platform Availability",
    body: "Market Villa aims to keep the platform available, but service interruptions may happen due to maintenance, third-party providers, internet issues, or technical problems.",
  },
  {
    title: "8. Limitation of Responsibility",
    body: "Market Villa provides tools for business visibility and customer inquiry management. Market Villa is not responsible for disputes between businesses and customers, failed deliveries, product quality issues, or offline transactions.",
  },
  {
    title: "9. Updates to These Terms",
    body: "These terms may be updated as Market Villa grows. Continued use of the platform means you accept the updated terms.",
  },
];

export default function TermsPage() {
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
          <div className="mb-8 grid h-11 w-14 place-items-center rounded-2xl bg-white text-slate-950">
            <ShieldCheck size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            Legal
          </p>

          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.05em] md:text-2xl">
            Terms of Service
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            These terms explain how businesses and users should use {BRAND.name}.
          </p>
        </section>

        <section className="mt-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-8 text-sm leading-7 text-slate-500">
            Last updated: 2026
          </p>

          <div className="grid gap-7">
            {sections.map((section) => (
              <div key={section.title} className="border-b border-slate-100 pb-7 last:border-b-0 last:pb-0">
                <h2 className="text-xl font-semibold tracking-[-0.03em] text-slate-950">
                  {section.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}


