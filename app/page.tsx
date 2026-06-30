import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Package,
  Search,
  ShoppingBag,
  Smartphone,
  Store,
  Timer,
} from "lucide-react";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { MotionReveal } from "@/components/MotionReveal";
import { TestimonialsSection } from "@/components/TestimonialsSection";

const benefits = [
  {
    title: "Website in minutes",
    body: "Launch a clean business page with products, prices, and contact details.",
    icon: Timer,
  },
  {
    title: "WhatsApp-ready orders",
    body: "Customers browse and send order requests through WhatsApp.",
    icon: MessageCircle,
  },
  {
    title: "Mobile-first storefront",
    body: "Your page feels simple, fast, and ready for buyers on phones.",
    icon: Smartphone,
  },
];

const steps = [
  {
    title: "Create your store",
    icon: Store,
  },
  {
    title: "Add your products",
    icon: Package,
  },
  {
    title: "Share your link",
    icon: ArrowRight,
  },
  {
    title: "Receive orders",
    icon: MessageCircle,
  },
];

const products = [
  {
    name: "Blush Bouquet",
    category: "Flowers",
    price: "₦12,000",
    color: "from-pink-100 to-rose-50",
  },
  {
    name: "Sunshine Bouquet",
    category: "Gifts",
    price: "₦15,000",
    color: "from-yellow-100 to-orange-50",
  },
  {
    name: "Rose Delight",
    category: "Flowers",
    price: "₦18,000",
    color: "from-red-100 to-pink-50",
  },
  {
    name: "Lily & Rose",
    category: "Premium",
    price: "₦20,000",
    color: "from-purple-100 to-fuchsia-50",
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "3 months free",
    note: "₦1,500/month for next 3 months",
    after: "₦3,000/month after intro period",
    cta: "Start free",
    href: "/signup",
    featured: true,
  },
  {
    name: "Grow",
    price: "₦7,000",
    note: "50% off first 6 months",
    after: "Only on bi-annual upgrade",
    cta: "Choose Grow",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "₦10,000",
    note: "50% off first 6 months",
    after: "Only on bi-annual upgrade",
    cta: "Choose Pro",
    href: "/signup",
    featured: false,
  },
];

const faqs = [
  "Do I need technical skills?",
  "Can customers order through WhatsApp?",
  "Can I use my own domain?",
  "What happens after the free period?",
];

function ProductArtwork({ color }: { color: string }) {
  return (
    <div
      className={`relative grid aspect-square place-items-center overflow-hidden rounded-2xl bg-gradient-to-br ${color}`}
    >
      <span className="absolute h-20 w-20 rounded-full bg-white/60 blur-2xl" />
      <span className="absolute bottom-5 left-5 h-10 w-10 rounded-full bg-white/50" />
      <span className="absolute right-7 top-7 h-8 w-8 rounded-full bg-white/70" />
      <ShoppingBag className="relative text-[#7c3aed]" size={38} />
    </div>
  );
}

function StorefrontPreview({ compact = false }: { compact?: boolean }) {
  return (
    <div className="overflow-hidden rounded-[1.65rem] border border-[#e3d7f7] bg-white">
      <div className="flex items-center justify-between border-b border-[#efe7fb] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#f2eaff] text-[#7c3aed]">
            <Store size={16} />
          </span>
          <div>
            <p className="text-sm font-bold text-[#241436]">Bloom Haven</p>
            {!compact ? (
              <p className="text-[11px] font-semibold text-[#7a6a8f]">
                Fresh flowers
              </p>
            ) : null}
          </div>
        </div>

        <div className="hidden items-center gap-2 rounded-full border border-[#e6dcf5] px-3 py-1.5 text-xs font-bold text-[#241436] sm:flex">
          <Search size={13} />
          Search
        </div>
      </div>

      <div className="grid gap-4 bg-[#fbf9ff] p-4 md:grid-cols-[1fr_0.82fr] md:items-center">
        <div className="rounded-[1.35rem] border border-[#ede4f9] bg-white p-5">
          <p className="max-w-xs text-2xl font-black leading-tight tracking-[-0.05em] text-[#241436]">
            Fresh flowers for every special moment.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-[#7c3aed] px-4 py-2 text-xs font-bold text-white">
              Shop now
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700">
              WhatsApp
            </span>
          </div>
        </div>

        <div className="grid min-h-36 place-items-center rounded-[1.35rem] bg-gradient-to-br from-pink-100 via-white to-purple-100">
          <ShoppingBag className="text-[#7c3aed]" size={58} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4 md:grid-cols-4">
        {products.map((product) => (
          <div
            key={product.name}
            className="rounded-2xl border border-[#eee5fa] bg-white p-2"
          >
            <ProductArtwork color={product.color} />
            <p className="mt-3 truncate text-xs font-bold text-[#241436]">
              {product.name}
            </p>
            <p className="mt-1 text-[11px] font-semibold text-[#7a6a8f]">
              {product.price}
            </p>
            {!compact ? (
              <button className="mt-2 min-h-8 w-full rounded-xl bg-[#7c3aed] text-[11px] font-bold text-white">
                Add to cart
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfaff] text-[#241436]">
      <PlatformNavbar />

      <section className="px-4 pb-10 pt-28 md:px-6 md:pb-14 md:pt-32">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <MotionReveal>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#e4d8f8] bg-white px-3 py-2 text-xs font-bold text-[#7c3aed]">
                <ShoppingBag size={14} />
                Simple websites. Real results.
              </div>

              <h1 className="mt-6 max-w-2xl text-[2.55rem] font-black leading-[1.04] tracking-[-0.06em] text-[#241436] md:text-[4.3rem]">
                Own a business website that looks{" "}
                <span className="text-[#7c3aed]">ready to sell.</span>
              </h1>

              <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#5f5370] md:text-lg">
                Create a clean business page, add products, share your link, and
                receive orders through WhatsApp.
              </p>

              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-[#eadffc] bg-[#f5efff] px-4 py-2 text-sm font-bold text-[#6d28d9]">
                <CheckCircle2 size={16} />
                Start with 3 months free on Starter.
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/signup"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-6 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-[#6d28d9]"
                >
                  Start free
                  <ArrowRight size={16} />
                </Link>

                <Link
                  href="/stores"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-[#cbb7ef] bg-white px-6 text-sm font-bold text-[#6d28d9] transition hover:-translate-y-0.5 hover:bg-[#f8f3ff]"
                >
                  View stores
                  <Store size={16} />
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-4 text-xs font-bold text-[#7a6a8f]">
                <span>No credit card</span>
                <span>Easy to use</span>
                <span>Cancel anytime</span>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} direction="right">
            <div className="rounded-[2rem] border border-[#e6daf7] bg-white p-3">
              <StorefrontPreview />
            </div>
          </MotionReveal>
        </div>
      </section>

      <section id="features" className="px-4 py-5 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-3 rounded-[1.65rem] border border-[#e7dcf7] bg-white p-4 md:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;

            return (
              <MotionReveal key={benefit.title} delay={index * 0.06}>
                <div className="flex gap-4 rounded-[1.25rem] border border-transparent p-4 transition hover:border-[#eadffc] hover:bg-[#fbf9ff]">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#f1e8ff] text-[#7c3aed]">
                    <Icon size={22} />
                  </span>
                  <div>
                    <h2 className="text-base font-black text-[#241436]">
                      {benefit.title}
                    </h2>
                    <p className="mt-1 text-sm font-medium leading-6 text-[#6f647d]">
                      {benefit.body}
                    </p>
                  </div>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </section>

      <section id="how" className="px-4 py-14 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-[-0.04em] md:text-3xl">
              How it works
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-4">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <MotionReveal key={step.title} delay={index * 0.06}>
                  <div className="relative rounded-[1.5rem] border border-[#e9ddf8] bg-white p-5 text-center">
                    <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-[#7c3aed] text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <span className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f2eaff] text-[#7c3aed]">
                      <Icon size={21} />
                    </span>
                    <h3 className="mt-4 text-sm font-black text-[#241436]">
                      {step.title}
                    </h3>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="examples" className="px-4 py-10 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
          <MotionReveal>
            <div>
              <h2 className="text-2xl font-black tracking-[-0.04em] md:text-3xl">
                See how your store looks
              </h2>
              <div className="mt-6 grid gap-3 text-sm font-bold text-[#5f5370]">
                {[
                  "Beautiful product display",
                  "Add to cart with one tap",
                  "WhatsApp checkout",
                  "Built for mobile",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle2 size={17} className="text-[#7c3aed]" />
                    {item}
                  </div>
                ))}
              </div>
              <Link
                href="/stores"
                className="mt-7 inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#cbb7ef] bg-white px-5 text-sm font-bold text-[#6d28d9] transition hover:-translate-y-0.5 hover:bg-[#f8f3ff]"
              >
                View live stores
              </Link>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} direction="right">
            <div className="grid gap-4 md:grid-cols-[0.48fr_1fr] md:items-end">
              <div className="rounded-[1.8rem] border border-[#e6daf7] bg-white p-3 md:translate-y-6">
                <StorefrontPreview compact />
              </div>
              <div className="rounded-[1.8rem] border border-[#e6daf7] bg-white p-3">
                <StorefrontPreview />
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section id="pricing" className="px-4 py-14 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-[-0.04em] md:text-3xl">
              Simple pricing. More value.
            </h2>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {pricingPlans.map((plan) => (
              <MotionReveal key={plan.name}>
                <div
                  className={`flex min-h-full flex-col rounded-[1.5rem] border bg-white p-6 ${
                    plan.featured
                      ? "border-[#8b5cf6]"
                      : "border-[#e7dcf7]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-black text-[#241436]">
                      {plan.name}
                    </h3>
                    {plan.featured ? (
                      <span className="rounded-full bg-[#f1e8ff] px-3 py-1 text-xs font-black text-[#7c3aed]">
                        Best to start
                      </span>
                    ) : null}
                  </div>

                  <p className="mt-5 text-3xl font-black tracking-[-0.05em] text-[#241436]">
                    {plan.price}
                    {plan.price.startsWith("₦") ? (
                      <span className="text-sm font-bold text-[#5f5370]">
                        {" "}
                        / month
                      </span>
                    ) : null}
                  </p>

                  <p className="mt-4 text-sm font-bold text-[#5f5370]">
                    {plan.note}
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#5f5370]">
                    {plan.after}
                  </p>

                  <Link
                    href={plan.href}
                    className={`mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl px-5 text-sm font-black transition hover:-translate-y-0.5 ${
                      plan.featured
                        ? "bg-[#7c3aed] text-white hover:bg-[#6d28d9]"
                        : "border border-[#cbb7ef] bg-white text-[#6d28d9] hover:bg-[#f8f3ff]"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              </MotionReveal>
            ))}
          </div>

          <p className="mt-5 text-center text-sm font-bold text-[#6f647d]">
            After intro pricing, quarterly, bi-annual, and annual billing
            resumes.
          </p>
        </div>
      </section>

      <section id="faq" className="px-4 py-10 md:px-6">
        <div className="mx-auto max-w-5xl rounded-[1.65rem] border border-[#e7dcf7] bg-white p-4">
          <h2 className="px-3 pb-3 text-center text-xl font-black tracking-[-0.03em]">
            Frequently asked questions
          </h2>

          <div className="grid gap-2">
            {faqs.map((question) => (
              <details
                key={question}
                className="group rounded-2xl border border-[#eadffc] bg-[#fdfbff] px-4 py-3"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-black text-[#241436]">
                  {question}
                  <HelpCircle
                    size={16}
                    className="text-[#7c3aed] transition group-open:rotate-45"
                  />
                </summary>
              </details>
            ))}
          </div>
        </div>
      </section>

      <TestimonialsSection />

      <section className="px-4 py-10 md:px-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[1.65rem] border border-[#5b21b6]/30 bg-[#241436] p-6 text-white md:flex-row md:items-center md:justify-between md:p-8">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">
              Ready to grow your business online?
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-[#6d28d9] transition hover:-translate-y-0.5"
            >
              Start free
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-white/25 px-6 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Login
            </Link>
          </div>
        </div>
      </section>

      <PlatformFooter />
    </main>
  );
}
