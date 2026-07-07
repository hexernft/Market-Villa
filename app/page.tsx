import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Package,
  Paintbrush,
  ReceiptText,
  Search,
  ShoppingBag,
  Sparkles,
  Store,
  UsersRound,
} from "lucide-react";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { MotionReveal } from "@/components/MotionReveal";

const pillars = [
  {
    title: "Professional Storefront",
    text: "A clean online shop buyers can trust on mobile and desktop.",
    icon: Store,
  },
  {
    title: "Products & Services",
    text: "Add items, prices, images, categories, and availability.",
    icon: Package,
  },
  {
    title: "Cart + WhatsApp Checkout",
    text: "Customers add items and send a ready order summary.",
    icon: MessageCircle,
  },
  {
    title: "Payments",
    text: "Prepare your store for online payment and settlement.",
    icon: CreditCard,
  },
  {
    title: "Orders & Customers",
    text: "Track saved orders and customer records from one dashboard.",
    icon: UsersRound,
  },
  {
    title: "Themes & Growth Tools",
    text: "Upgrade the storefront with premium designs and add-ons.",
    icon: Paintbrush,
  },
];

const steps = [
  "Create your store",
  "Add products or services",
  "Share your link",
  "Receive orders",
  "Manage everything",
];

const businessTypes = [
  "Fashion",
  "Food vendors",
  "Pastries",
  "Beauty",
  "Gadgets",
  "Tailors",
  "Services",
  "Events",
];

const pricingPlans = [
  {
    name: "Starter",
    price: "3 months free",
    note: "Then ₦1,500/month for next 3 months",
    after: "₦3,000/month after intro period",
    cta: "Start free",
    href: "/signup",
  },
  {
    name: "Growth",
    price: "₦7,000/month",
    note: "50% off first 6 months",
    after: "Only on bi-annual upgrade",
    cta: "Choose Growth",
    href: "/signup",
    featured: true,
  },
  {
    name: "Pro",
    price: "₦10,000/month",
    note: "50% off first 6 months",
    after: "Only on bi-annual upgrade",
    cta: "Choose Pro",
    href: "/signup",
  },
];

const faqs = [
  {
    question: "Is Market Villa only a business page?",
    answer:
      "No. Market Villa gives small businesses a storefront, product catalog, cart, WhatsApp checkout, order records, customers, themes, and billing tools.",
  },
  {
    question: "Can customers checkout through WhatsApp?",
    answer:
      "Yes. Customers can add products to cart and send a clean order summary to the business on WhatsApp.",
  },
  {
    question: "Can I accept online payments?",
    answer:
      "Market Villa includes payment foundations for businesses that want online checkout and settlement.",
  },
  {
    question: "Can I use a custom domain?",
    answer:
      "Yes. Businesses can request a custom domain when the storefront is ready.",
  },
];

function StorefrontMockup() {
  return (
    <div className="relative">
      <div className="absolute -left-4 top-8 hidden rounded-2xl border border-emerald-200 bg-white px-4 py-3 text-sm font-bold text-emerald-800 md:block">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} />
          Store published
        </div>
      </div>

      <div className="absolute -right-3 top-28 hidden rounded-2xl border border-amber-200 bg-[#fff8e7] px-4 py-3 text-sm font-bold text-[#7a4214] lg:block">
        <div className="flex items-center gap-2">
          <CreditCard size={16} />
          Payment confirmed
        </div>
      </div>

      <div className="absolute -bottom-5 left-8 z-10 hidden rounded-2xl border border-[#ead9c4] bg-white px-4 py-3 text-sm font-bold text-[#3a2114] md:block">
        <div className="flex items-center gap-2">
          <ReceiptText size={16} />
          New order received
        </div>
      </div>

      <div className="rounded-[2rem] border border-[#ead9c4] bg-white p-3">
        <div className="overflow-hidden rounded-[1.55rem] border border-[#efe2d2] bg-[#fffaf4]">
          <div className="flex items-center justify-between border-b border-[#efe2d2] bg-white px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#2a1710] text-[#f6b443]">
                <Store size={18} />
              </div>
              <div>
                <p className="text-sm font-black text-[#2a1710]">
                  Bloom & Basket
                </p>
                <p className="text-xs font-semibold text-[#8a7565]">
                  Published storefront
                </p>
              </div>
            </div>
            <div className="hidden items-center gap-2 rounded-full border border-[#ead9c4] px-3 py-2 text-xs font-bold text-[#6b4c3b] sm:flex">
              <Search size={14} />
              Search products
            </div>
          </div>

          <div className="grid gap-4 p-4 md:grid-cols-[1fr_0.85fr]">
            <div className="rounded-[1.4rem] bg-gradient-to-br from-[#2a1710] via-[#4a2615] to-[#f0a629] p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd88a]">
                Online store
              </p>
              <h2 className="mt-8 max-w-xs text-3xl font-black leading-tight tracking-[-0.05em]">
                Fresh gifts ready for checkout.
              </h2>
              <div className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-xs font-black text-[#2a1710]">
                Shop products
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ["Rose Box", "₦18,000"],
                ["Gift Basket", "₦25,000"],
                ["Mini Bouquet", "₦9,500"],
              ].map(([name, price]) => (
                <div
                  key={name}
                  className="grid grid-cols-[4.5rem_1fr] gap-3 rounded-[1.2rem] border border-[#efe2d2] bg-white p-3"
                >
                  <div className="rounded-2xl bg-[#f7ead9]" />
                  <div>
                    <p className="text-sm font-black text-[#2a1710]">
                      {name}
                    </p>
                    <p className="mt-1 text-sm font-black text-[#b33b21]">
                      {price}
                    </p>
                    <button className="mt-3 rounded-full bg-[#2a1710] px-3 py-1.5 text-xs font-bold text-white">
                      Add to cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-[#efe2d2] bg-white px-4 py-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-700">
              <MessageCircle size={14} />
              WhatsApp checkout ready
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fffaf4] text-[#2a1710]">
      <PlatformNavbar />

      <section className="px-4 pb-12 pt-28 md:px-6 md:pb-16 md:pt-32">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <MotionReveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead9c4] bg-white px-3 py-2 text-xs font-black text-[#7c3aed]">
                <Sparkles size={14} />
                Storefront system for small businesses
              </div>

              <h1 className="mt-6 max-w-2xl text-[2.65rem] font-black leading-[1.04] tracking-[-0.06em] text-[#2a1710] md:text-[4rem]">
                Launch a professional online storefront for your business.
              </h1>

              <p className="mt-5 max-w-2xl text-base font-medium leading-8 text-[#6b4c3b] md:text-lg">
                Sell products, receive orders, manage customers, accept
                payments, and let buyers checkout through WhatsApp or online —
                all from one simple Market Villa dashboard.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/signup"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#2a1710] px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-[#4a2615]"
                >
                  Create Your Storefront
                  <ArrowRight size={17} />
                </Link>
                <Link
                  href="/suya-spot"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#cdb89f] bg-white px-6 text-sm font-black text-[#2a1710] transition hover:-translate-y-0.5 hover:border-[#2a1710]"
                >
                  View Demo Store
                  <Store size={17} />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-[#7a6252]">
                {["No code needed", "Mobile-first", "WhatsApp-ready"].map(
                  (item) => (
                    <span key={item} className="inline-flex items-center gap-2">
                      <BadgeCheck size={15} className="text-[#7c3aed]" />
                      {item}
                    </span>
                  )
                )}
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08}>
            <StorefrontMockup />
          </MotionReveal>
        </div>
      </section>

      <section className="px-4 py-8 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 md:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <MotionReveal key={pillar.title}>
                <article className="h-full rounded-[1.35rem] border border-[#ead9c4] bg-white p-5 transition hover:-translate-y-0.5 hover:border-[#cdb89f]">
                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f4edff] text-[#7c3aed]">
                    <Icon size={21} />
                  </div>
                  <h2 className="mt-5 text-base font-black text-[#2a1710]">
                    {pillar.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-[#7a6252]">
                    {pillar.text}
                  </p>
                </article>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[#ead9c4] bg-white p-5 md:p-8">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                How it works
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.05em] text-[#2a1710] md:text-3xl">
                From setup to selling.
              </h2>
            </div>
            <Link
              href="/signup"
              className="inline-flex rounded-full bg-[#fff3df] px-4 py-2 text-sm font-black text-[#7a4214]"
            >
              Start free
            </Link>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-5">
            {steps.map((step, index) => (
              <div
                key={step}
                className="rounded-[1.25rem] border border-[#ead9c4] bg-[#fffaf4] p-4"
              >
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#2a1710] text-xs font-black text-[#f6b443]">
                  {index + 1}
                </span>
                <p className="mt-5 text-sm font-black text-[#2a1710]">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <MotionReveal>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                Built for real businesses
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#2a1710]">
                Flexible enough for what you sell.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-[#7a6252]">
                Market Villa keeps the storefront simple for buyers while
                giving owners the tools to organize products, customers, orders,
                payments, domains, and themes.
              </p>
            </div>
          </MotionReveal>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {businessTypes.map((type) => (
              <div
                key={type}
                className="rounded-[1.25rem] border border-[#ead9c4] bg-white p-4 text-sm font-black text-[#2a1710]"
              >
                {type}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] border border-[#ead9c4] bg-[#2a1710] p-5 text-white md:p-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#f6b443]">
              Demo store
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">
              See a real storefront experience.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
              Browse a premium food vendor demo with products, cart behavior,
              customer login, and WhatsApp checkout.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/suya-spot"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f6b443] px-5 text-sm font-black text-[#2a1710]"
              >
                View Demo Store
              </Link>
              <Link
                href="/signup"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-black text-white"
              >
                Create Similar Store
              </Link>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-4">
            <div className="rounded-[1.2rem] bg-[#fffaf4] p-4 text-[#2a1710]">
              <div className="flex items-center justify-between">
                <p className="font-black">S I S Suya Spot</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                  Live
                </span>
              </div>
              <div className="mt-4 h-36 rounded-2xl bg-gradient-to-br from-[#1c0f0a] via-[#4a2615] to-[#f6b443]" />
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["Classic Suya", "Grilled Chicken"].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-[#ead9c4] bg-white p-3"
                  >
                    <div className="mb-3 h-20 rounded-xl bg-[#f4e3cf]" />
                    <p className="text-sm font-black">{item}</p>
                    <p className="mt-1 text-sm font-black text-[#b33b21]">
                      ₦4,500
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
              Pricing
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[#2a1710]">
              Start simple. Grow when ready.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <article
                key={plan.name}
                className={`rounded-[1.5rem] border bg-white p-5 ${
                  plan.featured
                    ? "border-[#7c3aed] ring-4 ring-[#7c3aed]/10"
                    : "border-[#ead9c4]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black text-[#2a1710]">
                    {plan.name}
                  </h3>
                  {plan.featured ? (
                    <span className="rounded-full bg-[#f4edff] px-3 py-1 text-xs font-black text-[#7c3aed]">
                      Recommended
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-[#2a1710]">
                  {plan.price}
                </p>
                <p className="mt-3 text-sm font-bold text-[#6b4c3b]">
                  {plan.note}
                </p>
                <p className="mt-2 text-sm text-[#8a7565]">{plan.after}</p>
                <Link
                  href={plan.href}
                  className={`mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-full text-sm font-black ${
                    plan.featured
                      ? "bg-[#7c3aed] text-white"
                      : "border border-[#cdb89f] text-[#2a1710]"
                  }`}
                >
                  {plan.cta}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-12 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[2rem] border border-[#ead9c4] bg-white p-5 md:p-7">
          <div className="flex items-center gap-2">
            <HelpCircle className="text-[#7c3aed]" size={20} />
            <h2 className="text-2xl font-black tracking-[-0.05em] text-[#2a1710]">
              FAQ
            </h2>
          </div>

          <div className="mt-5 grid gap-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-2xl border border-[#ead9c4] bg-[#fffaf4] p-4"
              >
                <summary className="cursor-pointer text-sm font-black text-[#2a1710]">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm leading-6 text-[#7a6252]">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-14 pt-4 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[2rem] bg-[#2a1710] p-5 text-white md:flex-row md:items-center md:justify-between md:p-7">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.05em]">
              Ready to run your store online?
            </h2>
            <p className="mt-2 text-sm text-white/72">
              Create your storefront, add products, and start receiving orders.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#f6b443] px-5 text-sm font-black text-[#2a1710]"
            >
              Create Your Storefront
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 px-5 text-sm font-black text-white"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}
