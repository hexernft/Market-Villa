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

const faqItems = [
  {
    question: "Do I need technical skills?",
    answer:
      "No. Market Villa is built so a business owner can create and manage a simple page without writing code.",
  },
  {
    question: "Can customers order through the page?",
    answer:
      "Yes. Customers can view your products or services and start a clear WhatsApp order or inquiry.",
  },
  {
    question: "Can I use my own domain?",
    answer:
      "Yes. Custom domain setup can be requested as an add-on when the business is ready.",
  },
  {
    question: "What kind of businesses can use Market Villa?",
    answer:
      "Food vendors, fashion brands, beauty businesses, apartments, retail stores, and service providers can all use it.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-slate-950">
      <PlatformNavbar />

      <section className="px-5 pb-14 pt-32 md:px-8 md:pb-16 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.65fr] lg:items-center">
            <div>
              <div className="mb-6 flex items-center gap-2">
                <Image
                  src="/market-villa-logo.png"
                  alt="Market Villa"
                  width={78}
                  height={78}
                  className="market-villa-logo-float h-[68px] w-[68px] object-contain"
                  priority
                />

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Market Villa
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Simple business pages
                  </p>
                </div>
              </div>

              <h1 className="max-w-2xl text-3xl font-semibold leading-[1.12] tracking-[-0.04em] text-slate-950 md:text-4xl">
                Start simple. Look professional. Sell with confidence.
              </h1>

              <p className="mt-5 max-w-xl text-base leading-8 text-slate-600">
                Create a clean business page in minutes, add your details, and
                share your link with customers.
              </p>

              <div className="mt-8">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-6 py-3.5 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Create Business Page
                  <ArrowRight size={17} />
                </Link>
              </div>
            </div>

            <div className="hidden border border-slate-200 bg-slate-50 p-5 lg:block">
              <div className="bg-white p-5 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center bg-slate-950 text-white">
                    <Store size={20} />
                  </span>

                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    Live
                  </span>
                </div>

                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                  Your page
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-slate-950">
                  Business details, products, services, and WhatsApp contact.
                </h2>

                <div className="mt-7 grid gap-3">
                  {["Clean profile", "Organized offers", "Simple contact flow"].map(
                    (item) => (
                      <div
                        key={item}
                        className="flex items-center justify-between border border-slate-200 bg-white p-4"
                      >
                        <span className="text-sm font-semibold text-slate-700">
                          {item}
                        </span>
                        <CheckCircle2 size={17} className="text-emerald-600" />
                      </div>
                    )
                  )}
                </div>
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

      <section className="bg-slate-950 px-5 py-16 text-white md:px-8">
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

      <section id="faq" className="px-5 py-16 md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-slate-950 md:text-4xl">
              Simple answers before you start.
            </h2>
          </div>

          <div className="overflow-hidden border border-slate-200 bg-white">
            {faqItems.map((item, index) => (
              <div
                key={item.question}
                className="grid gap-3 border-t border-slate-200 p-6"
              >
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                  {item.question}
                </h3>

                <p className="text-sm leading-7 text-slate-500">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}