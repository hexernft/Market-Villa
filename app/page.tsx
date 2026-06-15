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
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { MotionReveal } from "@/components/MotionReveal";

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
    <main className="min-h-screen bg-[#07070b] text-slate-950">
      <PlatformNavbar />
      <section className="bg-[radial-gradient(circle_at_top_right,rgba(139,77,255,0.20),transparent_34%),linear-gradient(180deg,#07070b_0%,#ffffff_100%)] px-5 pb-14 pt-32 md:px-8 md:pb-16 md:pt-36">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_0.65fr] lg:items-center">
            <MotionReveal>
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
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#8b4dff] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#a36cff]"
                >
                  Create Business Page
                  <ArrowRight size={17} className="text-white" />
                </Link>
                <Link
                  href="/stores"
                  className="market-villa-blink-cta ml-3 inline-flex items-center justify-center rounded-full border border-[#8b4dff] px-6 py-3.5 text-sm font-semibold shadow-sm transition"
                >
                  Explore Stores
                </Link>
              </div>
            </MotionReveal>
            <HeroImageCarousel />
          </div>
        </div>
      </section>
      <section
        id="how"
        className="border-y border-purple-200 bg-[#151026] px-5 py-14 md:px-8"
      >
        <div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <MotionReveal key={feature.title} delay={index * 0.08}>
                <div className="premium-card-hover border border-purple-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#8b4dff]/50 hover:shadow-md">
                  <div className="mb-8 grid h-11 w-11 place-items-center rounded-2xl bg-[#8b4dff] text-white shadow-sm">
                    <Icon size={20} />
                  </div>

                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-slate-950">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </section>
      <section className="bg-[#8b4dff] px-5 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-white">
              Why Market Villa
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              A simple page before the WhatsApp conversation.
            </h2>
          </div>

          <div className="grid gap-4">
            {[
              "Customers see your business clearly before messaging.",
              "Products and services stay organized in one place.",
              "Business owners can keep their page updated anytime.",
            ].map((item, index) => (
              <MotionReveal key={item} delay={index * 0.08} direction="right">
                <div className="flex gap-3 border border-white/25 bg-white/15 p-5 shadow-sm backdrop-blur transition hover:bg-white/20">
                  <CheckCircle2
                    size={18}
                    className="mt-1 shrink-0 text-white"
                  />
                  <p className="text-sm leading-7 text-white/85">{item}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>
      <section id="faq" className="bg-black px-5 py-16 text-white md:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-semibold tracking-[0.18em] text-white">
              FAQ
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white md:text-4xl">
              Simple answers before you start.
            </h2>
          </div>

          <div className="overflow-hidden border border-[#8b4dff]/25 bg-white/5">
            {faqItems.map((item, index) => (
              <MotionReveal key={item.question} delay={index * 0.06}>
                <div className="grid gap-3 border-t border-white/10 p-6 first:border-t-0 hover:bg-[#8b4dff]/5">
                  <h3 className="text-lg font-semibold tracking-[-0.03em] text-white">
                    {item.question}
                  </h3>

                  <p className="text-sm leading-7 text-white/65">
                    {item.answer}
                  </p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>{" "}
      <section className="relative overflow-hidden border-y border-[#a36cff] bg-[#8b4dff] py-1.5">
        <div className="pointer-events-none absolute bottom-0 left-0 top-0 z-10 w-[192px] bg-[#e85f00]" />

        <div className="market-villa-marquee relative z-0 flex whitespace-nowrap text-[11px] font-medium leading-none text-white">
          <span className="mx-5">
            Market Villa helps businesses create clean pages, organize products
            and services, receive WhatsApp inquiries, and look more trusted
            online.
          </span>
          <span className="mx-5">
            Simple business pages. Smart storefronts. WhatsApp-ready selling.
            Custom domain support. Built for small businesses.
          </span>
          <span className="mx-5">
            Market Villa helps businesses create clean pages, organize products
            and services, receive WhatsApp inquiries, and look more trusted
            online.
          </span>
          <span className="mx-5">
            Simple business pages. Smart storefronts. WhatsApp-ready selling.
            Custom domain support. Built for small businesses.
          </span>
        </div>
      </section>
      <PlatformFooter />
    </main>
  );
}
