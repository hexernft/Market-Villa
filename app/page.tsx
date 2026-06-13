import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Globe2,
  MessageCircle,
  Store,
} from "lucide-react";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { PlatformFooter } from "@/components/PlatformFooter";

const features = [
  {
    title: "A polished business page",
    description:
      "Give customers one clean place to view your brand, offers, contact details, and order options.",
    icon: Store,
  },
  {
    title: "WhatsApp-ready selling",
    description:
      "Customers can browse your page and start a clear order or inquiry conversation on WhatsApp.",
    icon: MessageCircle,
  },
  {
    title: "Custom domain option",
    description:
      "Upgrade from a Market Villa link to a professional domain when the business is ready.",
    icon: Globe2,
  },
];

const businessTypes = [
  "Food vendors",
  "Fashion brands",
  "Beauty businesses",
  "Apartments",
  "Service providers",
  "Retail stores",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <PlatformNavbar />

      <section className="px-5 pb-16 pt-32 md:px-8 md:pb-20 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-1 lg:items-center">
            <div>
              <p className="mb-5 text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Market Villa
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.08] tracking-[-0.05em] text-slate-950 md:text-5xl">
                Simple business pages that make your brand look polished,
                trusted, and ready to sell.
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600">
                A clean mini website for businesses that need a professional
                online presence without building a full ecommerce platform.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create Business Page
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="border-y border-slate-200 bg-slate-50 px-5 py-14 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div key={feature.title} className="border border-slate-200 bg-white p-6">
                <div className="mb-8 grid h-11 w-11 place-items-center bg-slate-950 text-white">
                  <Icon size={20} />
                </div>

                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-500">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Built for
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
              Small businesses that need to look serious online.
            </h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {businessTypes.map((type) => (
              <div
                key={type}
                className="border border-slate-200 bg-white p-5 text-sm font-semibold text-slate-800"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-slate-950 px-5 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">
              Why Market Villa
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
              A simple page before the WhatsApp conversation.
            </h2>
          </div>

          <div className="grid gap-4">
            {[
              "Customers see your business clearly before messaging.",
              "Products and services stay organized in one place.",
              "The business owner can update content without a developer.",
            ].map((item) => (
              <div key={item} className="flex gap-3 border border-white/10 bg-white/5 p-5">
                <CheckCircle2 size={18} className="mt-1 shrink-0 text-white" />
                <p className="text-sm leading-7 text-white/75">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 border border-slate-200 bg-white p-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Start simple
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950">
              Create a business page in minutes.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              Set up your page, add business details, publish, and share your
              link with customers.
            </p>
          </div>

          <Link
            href="/signup"
            className="inline-flex items-center justify-center gap-2 bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            Get Started
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}

