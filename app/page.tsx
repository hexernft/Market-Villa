import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  MessageCircle,
  Package,
  ShoppingBag,
  Smartphone,
  Store,
  Timer,
} from "lucide-react";
import { PlatformFooter } from "@/components/PlatformFooter";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { MotionReveal } from "@/components/MotionReveal";
import { TestimonialsSection } from "@/components/TestimonialsSection";

const carouselImages = [
  {
    src: "/market-villa-home/storefront-flowers.png",
    alt: "Premium flower store website preview built for Market Villa",
    label: "Gift stores",
  },
  {
    src: "/market-villa-home/storefront-food-dark.png",
    alt: "Dark purple food vendor storefront preview built for Market Villa",
    label: "Food vendors",
  },
  {
    src: "/market-villa-home/storefront-fashion.png",
    alt: "Premium African fashion storefront preview built for Market Villa",
    label: "Fashion brands",
  },
  {
    src: "/market-villa-home/storefront-home-decor.png",
    alt: "Home decor storefront preview built for Market Villa",
    label: "Home decor",
  },
  {
    src: "/market-villa-home/storefront-food-light.png",
    alt: "Bright food and drinks storefront preview built for Market Villa",
    label: "Daily sellers",
  },
];

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
    details: "Add your business name, contact details, logo, and banner.",
    icon: Store,
  },
  {
    title: "Add your products",
    details: "Upload product images, names, categories, and prices.",
    icon: Package,
  },
  {
    title: "Share your link",
    details: "Send your store link to customers on WhatsApp and social media.",
    icon: ArrowRight,
  },
  {
    title: "Receive orders",
    details: "Customers browse, add to cart, and checkout through WhatsApp.",
    icon: MessageCircle,
  },
];

const pricingPlans = [
  {
    name: "Starter",
    price: "3 months free",
    note: "\u20A61,500/month for next 3 months",
    after: "\u20A63,000/month after intro period",
    cta: "Start free",
    href: "/signup",
    featured: true,
  },
  {
    name: "Grow",
    price: "\u20A67,000",
    note: "50% off first 6 months",
    after: "Only on bi-annual upgrade",
    cta: "Choose Grow",
    href: "/signup",
    featured: false,
  },
  {
    name: "Pro",
    price: "\u20A610,000",
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

function StorefrontCarousel({ compact = false }: { compact?: boolean }) {
  return (
    <div className="relative overflow-hidden rounded-[1.8rem] border border-[#ded0f2] bg-[#170d23]">
      <div
        className={
          compact
            ? "relative aspect-[4/3] md:aspect-[16/10]"
            : "relative aspect-[4/3] md:aspect-[16/10]"
        }
      >
        {carouselImages.map((image, index) => (
          <div
            key={image.src}
            className="mv-home-carousel-slide absolute inset-0"
            style={{ animationDelay: `${index * 5}s` }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              priority={index === 0}
              sizes={
                compact
                  ? "(min-width: 1024px) 48vw, 100vw"
                  : "(min-width: 1024px) 58vw, 100vw"
              }
              className="object-cover"
            />
          </div>
        ))}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#170d23]/70 to-transparent" />

        {!compact ? (
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/14 bg-[#241436]/70 px-4 py-3 text-white backdrop-blur-xl">
            <div className="flex items-center gap-2 text-sm font-black">
              <ShoppingBag size={16} />
              Your store can look like this too
            </div>
            <div className="flex gap-1.5">
              {carouselImages.map((image, index) => (
                <span
                  key={image.label}
                  className="mv-home-carousel-dot h-2 w-2 rounded-full bg-white/45"
                  style={{ animationDelay: `${index * 5}s` }}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-[#fcfaff] text-[#241436]">
      <style>{`
        @keyframes mvHomeCarousel {
          0%, 16% { opacity: 1; transform: scale(1); }
          20%, 96% { opacity: 0; transform: scale(1.018); }
          100% { opacity: 1; transform: scale(1); }
        }

        @keyframes mvHomeCarouselDot {
          0%, 16% { opacity: 1; transform: scale(1.22); }
          20%, 96% { opacity: .38; transform: scale(1); }
          100% { opacity: 1; transform: scale(1.22); }
        }

        .mv-home-carousel-slide {
          opacity: 0;
          animation: mvHomeCarousel 25s infinite;
        }

        .mv-home-carousel-dot {
          animation: mvHomeCarouselDot 25s infinite;
        }

        .mv-flip-card {
          perspective: 1200px;
        }

        .mv-flip-inner {
          transform-style: preserve-3d;
          transition: transform 520ms cubic-bezier(.2,.8,.2,1);
        }

        .mv-flip-card:hover .mv-flip-inner,
        .mv-flip-card:focus-within .mv-flip-inner {
          transform: rotateY(180deg);
        }

        .mv-flip-face {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .mv-flip-back {
          transform: rotateY(180deg);
        }
      `}</style>

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
                Start for free. Set-up in minutes.
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
              <StorefrontCarousel />
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
                  <div
                    className="mv-flip-card h-48 rounded-[1.5rem] outline-none"
                    tabIndex={0}
                  >
                    <div className="mv-flip-inner relative h-full w-full">
                      <div className="mv-flip-face absolute inset-0 grid place-items-center rounded-[1.5rem] border border-[#4f2a76] bg-[#241436] p-5 text-center text-white">
                        <div>
                          <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-white text-xs font-black text-[#7c3aed]">
                            {index + 1}
                          </span>
                          <span className="mx-auto mt-4 grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-[#c4b5fd] ring-1 ring-white/15">
                            <Icon size={21} />
                          </span>
                          <h3 className="mt-4 text-sm font-black text-white">
                            {step.title}
                          </h3>
                        </div>
                      </div>

                      <div className="mv-flip-face mv-flip-back absolute inset-0 grid place-items-center rounded-[1.5rem] border border-[#7c3aed]/30 bg-[#2f1a46] p-5 text-center text-white">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c4b5fd]">
                            Step {index + 1}
                          </p>
                          <h3 className="mt-3 text-base font-black text-white">
                            {step.title}
                          </h3>
                          <p className="mt-3 text-sm font-semibold leading-6 text-white/78">
                            {step.details}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section id="examples" className="px-4 py-10 md:px-6">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
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
              <div className="overflow-hidden rounded-[1.8rem] border border-[#e6daf7] bg-white p-3 md:translate-y-6">
                <div className="relative aspect-[9/16] overflow-hidden rounded-[1.4rem]">
                  <Image
                    src="/market-villa-home/storefront-fashion.png"
                    alt="Mobile-ready fashion storefront preview"
                    fill
                    sizes="(min-width: 1024px) 24vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="rounded-[1.8rem] border border-[#e6daf7] bg-white p-3">
                <StorefrontCarousel compact />
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
                    {plan.price.startsWith("\u20A6") ? (
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
