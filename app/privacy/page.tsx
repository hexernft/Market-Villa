import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { BRAND } from "@/lib/brand";

const sections = [
  {
    title: "1. Information We Collect",
    body: "Market Villa may collect account information, business details, product and service information, uploaded images, customer order details, payment references, and basic platform usage data.",
  },
  {
    title: "2. How We Use Information",
    body: "We use information to create business pages, process subscriptions, display storefront content, save customer orders, support businesses, improve the platform, and protect against abuse.",
  },
  {
    title: "3. Customer Order Information",
    body: "When customers place orders or send inquiries through a Market Villa the submitted details may be saved so the business owner can manage and follow up on the order.",
  },
  {
    title: "4. Payments",
    body: "Payments may be processed through third-party payment providers. Market Villa does not store full card details. Payment references and transaction statuses may be stored for subscription and record purposes.",
  },
  {
    title: "5. Image Uploads",
    body: "Businesses may upload product images, cover images, and other business assets. These files may be stored through cloud storage services and displayed publicly on the business page.",
  },
  {
    title: "6. Sharing of Information",
    body: "Market Villa does not sell business or customer data. Information may be shared with service providers only where needed to operate hosting, storage, payments, support, and platform functionality.",
  },
  {
    title: "7. Data Security",
    body: "Market Villa uses authentication, database access controls, storage policies, and secure hosting practices to help protect user and business data.",
  },
  {
    title: "8. Business Owner Responsibilities",
    body: "Business owners are responsible for handling customer information respectfully and only using customer order details for legitimate business communication and fulfillment.",
  },
  {
    title: "9. Data Requests",
    body: "Business owners may request access to or export of their business data. Data removal requests can be reviewed based on account status, legal obligations, and platform requirements.",
  },
  {
    title: "10. Updates to This Policy",
    body: "This privacy policy may be updated as Market Villa adds new features, integrations, and services.",
  },
];

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-100 px-5 py-10 md:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50"
        >
          <ArrowLeft size={17} />
          Back to Market Villa
        </Link>

        <section className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-soft md:p-10">
          <div className="mb-8 grid h-14 w-14 place-items-center rounded-2xl bg-white text-slate-950">
            <LockKeyhole size={24} />
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-teal-200">
            Privacy
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
            Privacy Policy
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
            This policy explains how {BRAND.name} handles business, customer, and platform data.
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

        <p className="mt-6 text-center text-xs leading-6 text-slate-500">
          This is a starter privacy page. Before public launch, review it with a qualified legal professional.
        </p>
      </div>
    </main>
  );
}
