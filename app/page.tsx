import {
  TestimonialsSection } from "@/components/TestimonialsSection";
import Image from "next/image";
import Link from "next/link";
import {
  CakeSlice, CheckCircle2, Clock3, ExternalLink, Globe2, MapPin, MessageCircle, Store } from "lucide-react";
import {
  PlatformNavbar } from "@/components/PlatformNavbar";
import {
  PlatformFooter } from "@/components/PlatformFooter";
import {
  MotionReveal } from "@/components/MotionReveal";
import {
  HomeCommerceExperiences } from "@/components/HomeCommerceExperiences";
import {
  RotatingHeroPromise } from "@/components/RotatingHeroPromise";

const features = [
  {
  title: "A polished business page", description: "Give customers one clean place to view your brand, offers, contact details, and order options.", icon: Store },
  {
  title: "WhatsApp-ready selling", description: "Customers can browse your page and start a clear order or inquiry conversation on WhatsApp.", icon: MessageCircle },
  {
  title: "Custom domain option", description: "Upgrade from a Market Villa link to a professional domain when the business is ready.", icon: Globe2 },
];

const faqItems = [
  {
  question: "Do I need technical skills?", answer: "No. Market Villa is built so a business owner can create and manage a simple page without writing code." },
  {
  question: "Can customers order through the page?", answer: "Yes. Customers can view your products and start a clear WhatsApp order or inquiry." },
  {
  question: "Can I use my own domain?", answer: "Yes. Custom domain setup can be requested as an add-on when the business is ready." },
  {
  question: "What kind of businesses can use Market Villa?", answer: "Food vendors, fashion brands, beauty businesses, apartments, and retail stores can all use it." },
];

const zcasTreats = [
  "Pink Cupcake Box",
  "Classic Doughnuts",
  "Custom Celebration Cake",
  "Golden Meat Pie",
];

export default function Home() {
  return (
    <main className="mv-page-shell min-h-screen text-[#241436]">
      <PlatformNavbar />

      <section className="mv-lavender-hero home-hero-section px-4 pb-20 pt-28 md:px-4 md:pb-24 md:pt-32">
        <div className="mx-auto max-w-7xl">
          <div className="market-hero-carousel home-hero-visual relative min-h-[520px] overflow-hidden rounded-[2.5rem] border border-white/65 shadow-[0_30px_100px_rgba(55,31,83,0.18)] md:min-h-[640px]">
            <div
              className="market-hero-carousel-slide"
              style={{
  animationDelay: "0s" }}
            >
              <Image
                src="/main-hero.png"
                alt="Market Villa storefront preview"
                fill
                priority
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div
              className="market-hero-carousel-slide"
              style={{
  animationDelay: "5s" }}
            >
              <Image
                src="/phone-shop.png"
                alt="Phone shop storefront preview"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div
              className="market-hero-carousel-slide"
              style={{
  animationDelay: "10s" }}
            >
              <Image
                src="/phone-hub.png"
                alt="Mobile business storefront preview"
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.10),transparent_30%)]" />
          </div>

          <div className="hero-carousel-copy-card home-hero-copy relative z-10 mx-auto -mt-20 max-w-5xl rounded-[2.1rem] border border-white/75 bg-white/86 p-5 shadow-[0_28px_85px_rgba(55,31,83,0.18)] backdrop-blur-2xl md:-mt-24 md:p-7 lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:gap-8 lg:p-8">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-[#7c3aed]">
                Business hosting made beautiful
              </p>

              <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#7c3aed]/15 bg-[#f3edff] px-3 py-2 text-xs font-bold text-[#241436]">
                <CheckCircle2 size={15} className="text-[#7c3aed]" />
                1 month free on Starter. Then ₦2,000/month for the next 3
                months, billed quarterly from month 2.
              </div>

              <h1 className="mt-3 max-w-3xl text-[2.55rem] font-semibold leading-[1.03] text-[#241436] md:text-[4rem]">
                Start simple. Look professional.
                <RotatingHeroPromise />
              </h1>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#241436]/68">
                Create a clean business page in minutes, add your details, and share your link with customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeCommerceExperiences />

      <section className="px-4 py-10 md:px-4">
        <div className="home-showcase-card home-light-panel mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-white/75 bg-white/76 p-5 shadow-[0_30px_90px_rgba(36,20,54,0.18)] backdrop-blur-2xl lg:grid-cols-[1.08fr_0.92fr] lg:p-7">
          <div className="relative min-h-[420px] overflow-hidden rounded-[1.65rem] bg-[#fff5f7]">
            <Image
              src="/zcas-tastybites-spread.png"
              alt="ZCAS TastyBites cupcakes, doughnuts, cake, drinks, and meat pies"
              fill
              sizes="(min-width: 1024px) 54vw, 100vw"
              className="object-cover"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.02),rgba(36,20,54,0.36))]" />

            <div className="home-dark-panel absolute bottom-4 left-4 right-4 rounded-[1.35rem] border border-white/22 bg-black/42 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.24)] backdrop-blur-xl md:left-auto md:max-w-sm">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#ffd93d]">
                Featured food business
              </p>
              <h2 className="mt-2 text-3xl font-semibold leading-[1.02] text-white">
                ZCAS TastyBites
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/76">
                Homemade with love in Abuja.
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 p-1 md:p-2">
            <div>
              <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">
                <CakeSlice size={15} />
                Business spotlight
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-semibold leading-[1.03] text-[#241436] md:text-5xl">
                Where every bite tells a story.
              </h2>

              <p className="mt-5 max-w-xl text-sm leading-7 text-[#241436]/70">
                ZCAS TastyBites crafts artisan pastries, custom cakes, sweet snacks, and refreshing drinks for customers in Abuja.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="home-mini-card rounded-[1.25rem] border border-[#7c3aed]/12 bg-[#f8f4ff] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#241436]">
                    <MapPin size={16} className="text-[#7c3aed]" />
                    Abuja, Nigeria
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#241436]/62">
                    Local homemade treats with WhatsApp orders.
                  </p>
                </div>

                <div className="home-mini-card rounded-[1.25rem] border border-[#7c3aed]/12 bg-[#fff5f7] p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#241436]">
                    <Clock3 size={16} className="text-[#7c3aed]" />
                    Open daily
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#241436]/62">
                    Mon-Fri 8am-8pm, weekends from 9am.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {zcasTreats.map((treat) => (
                  <span
                    key={treat}
                    className="rounded-2xl border border-[#7c3aed]/12 bg-white/78 px-3 py-2 text-xs font-bold text-[#241436]/78 shadow-sm"
                  >
                    {treat}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <a
                href="https://wa.me/2348148124675?text=Hello%20ZCAS%20TastyBites%2C%20I%20would%20like%20to%20place%20an%20order."
                target="_blank"
                rel="noreferrer"
                className="market-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white"
              >
                <MessageCircle size={16} />
                Order on WhatsApp
              </a>

              <a
                href="https://zcas.vercel.app/index.html"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7c3aed]/15 bg-white/76 px-4 py-2.5 text-sm font-semibold text-[#241436] shadow-sm hover:bg-white"
              >
                Visit ZCAS
                <ExternalLink size={15} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-4">
        <div className="fashion-brand-showcase home-showcase-card mx-auto grid max-w-7xl overflow-hidden text-white shadow-[0_30px_90px_rgba(36,20,54,0.2)] lg:grid-cols-[0.86fr_1.14fr]">
          <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
                Fashion brand example
              </p>

              <h2 className="mt-4 max-w-xl text-3xl font-semibold tracking-[-0.05em] text-white md:text-5xl">
                Give African fashion the kind of storefront it deserves.
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-white/68">
                Present collections, textile detail, and founder craft with a page that feels premium before the first WhatsApp message.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="home-mini-card rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-sm font-semibold text-white">Editorial product story</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Lead with a rich boutique image that shows the full brand mood.
                </p>
              </div>

              <div className="home-mini-card rounded-2xl border border-white/10 bg-white/8 p-4">
                <p className="text-sm font-semibold text-white">Handmade trust</p>
                <p className="mt-2 text-sm leading-6 text-white/60">
                  Add a close atelier moment that makes the craft feel personal.
                </p>
              </div>
            </div>
          </div>

          <div className="fashion-brand-visual home-image-stage relative min-h-[420px] overflow-hidden">
            <Image
              src="/african-fashion-editorial.png"
              alt="African fashion brand storefront editorial"
              fill
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="fashion-brand-main object-cover"
            />

            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,20,54,0.42),rgba(36,20,54,0.04)_46%,rgba(36,20,54,0.32))]" />

            <div className="fashion-brand-accent home-floating-accent absolute">
              <Image
                src="/african-fashion-atelier.png"
                alt="African fashion atelier detail"
                fill
                sizes="(min-width: 1024px) 22vw, 48vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-10 md:px-4">
        <div className="sleekstitch-showcase home-showcase-card mx-auto grid max-w-7xl overflow-hidden bg-black text-white shadow-[0_30px_90px_rgba(36,20,54,0.2)] lg:grid-cols-[1.15fr_0.85fr]">
          <div className="sleekstitch-device-wrap flex min-h-[560px] items-center justify-center p-8 md:p-10">
            <div className="sleekstitch-tablet home-floating-tablet">
              <div className="sleekstitch-gallery grid h-full gap-3 sm:grid-cols-[1.15fr_0.85fr]">
                <div className="relative min-h-[420px] overflow-hidden bg-neutral-950">
                  <Image
                    src="/sleekstitch-luxury.png"
                    alt="Sleek Luxury by SleekStitch Atelier"
                    fill
                    sizes="(min-width: 1024px) 44vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="relative min-h-[420px] overflow-hidden bg-neutral-950">
                  <Image
                    src="/sleekstitch-executive.png"
                    alt="Sleek Executive by SleekStitch Atelier"
                    fill
                    sizes="(min-width: 1024px) 32vw, 100vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-6 md:p-8 lg:p-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-white/45">
                SleekStitch Atelier
              </p>

              <h2 className="mt-4 max-w-md text-4xl font-semibold tracking-[-0.06em] text-white md:text-6xl">
                Confidence, stitched with intention.
              </h2>
            </div>

            <p className="mt-8 max-w-md text-sm leading-7 text-white/64">
              High-quality custom clothing with flawless craftsmanship, designed to reflect each client&apos;s individuality.
            </p>
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-10 md:px-4">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-center text-2xl font-semibold text-white md:text-2xl">
            Powerful tools. Beautiful results.
          </h2>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
  const Icon = feature.icon;
              const glowClass =
                index === 0
                  ? "mv-empty-feature-card-1"
                  : index === 1
                  ? "mv-empty-feature-card-2"
                  : "mv-empty-feature-card-3";

              return (
                <MotionReveal key={feature.title} delay={index * 0.08}>
                  <div className={`mv-empty-feature-card home-lift-card ${glowClass} flex flex-col items-center justify-center p-7 text-center`}>
                    <span className="mv-empty-feature-light" />

                    <div className="relative z-10 mb-6 grid h-14 w-14 place-items-center rounded-[1.25rem] border border-[#c4b5fd]/24 bg-white/10 text-[#c4b5fd] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]">
                      <Icon size={24} />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-lg font-semibold leading-tight text-white">
                        {feature.title}
                      </h3>

                      <p className="mt-3 max-w-[19rem] text-base leading-7 text-white/74">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

<section className="px-4 py-8 md:px-4">
        <div className="mv-why-panel home-showcase-card mx-auto grid max-w-7xl gap-5 rounded-[2rem] p-6 text-white shadow-[0_28px_70px_rgba(36,20,54,0.22)] lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Why Market Villa</p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-2xl">A simple page before the WhatsApp conversation.</h2>
          </div>
          <div className="grid gap-3">
            {[
              "Customers see your business clearly before messaging.",
              "Products stay organized in one place.",
              "Business owners can keep their page updated anytime.",
            ].map((item, index) => (
              <MotionReveal key={item} delay={index * 0.08} direction="right">
                <div className="home-mini-card flex gap-3 rounded-[1.35rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <CheckCircle2 size={17} className="mt-1 shrink-0 text-[#c4b5fd]" />
                  <p className="text-[20px] leading-8 text-white/80">{item}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="px-4 py-10 md:px-4">
        <div className="mx-auto grid max-w-7xl gap-7 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7c3aed]">FAQ</p>
            <h2 className="mt-3 text-2xl font-semibold text-[#241436] md:text-2xl">Simple answers before you start.</h2>
          </div>
          <div className="mv-soft-panel home-showcase-card overflow-hidden rounded-[1.8rem]">
            {faqItems.map((item, index) => (
              <MotionReveal key={item.question} delay={index * 0.06}>
                <div className="grid gap-2 border-t border-[#7c3aed]/10 p-5 first:border-t-0 hover:bg-white/30">
                  <h3 className="text-sm font-semibold text-[#241436]">{item.question}</h3>
                  <p className="text-sm leading-6 text-[#241436]/62">{item.answer}</p>
                </div>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#241436] py-2">
        <div className="market-villa-marquee flex whitespace-nowrap text-[11px] font-medium leading-none text-white/70">
          <span className="mx-5">Market Villa helps businesses create clean pages, organize products, receive WhatsApp inquiries, and look more trusted online.</span>
          <span className="mx-5">Simple business pages. Smart storefronts. WhatsApp-ready selling. Custom domain support. Built for small businesses.</span>
          <span className="mx-5">Market Villa helps businesses create clean pages, organize products, receive WhatsApp inquiries, and look more trusted online.</span>
          <span className="mx-5">Simple business pages. Smart storefronts. WhatsApp-ready selling. Custom domain support. Built for small businesses.</span>
        </div>
      </section>

      <section className="mobile-showcase-section px-4 py-12 md:px-4">
        <div className="mobile-showcase-panel mx-auto grid max-w-7xl gap-8 overflow-hidden rounded-[2.1rem] border border-white/18 bg-[linear-gradient(145deg,#050008,#12051f_48%,#241436)] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.38)] md:p-8 lg:grid-cols-[0.88fr_1.12fr] lg:items-center lg:p-10">
          <div>
            <p className="mobile-showcase-kicker text-[11px] font-bold uppercase tracking-[0.24em] text-[#ffb36b]">
              Device-ready storefronts
            </p>

            <h2 className="mobile-showcase-title mt-4 max-w-2xl text-[2.35rem] font-semibold leading-[1.02] text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.55)] md:text-[4rem]">
              Your business looks premium on every screen.
            </h2>

            <p className="mobile-showcase-copy mt-5 max-w-xl text-base font-medium leading-8 text-white/90">
              From furniture stores to food vendors, Market Villa helps businesses present products, prices, and customer actions in a clean mobile-ready page.
            </p>

            <div className="mobile-showcase-tabs mt-7 grid gap-3 sm:grid-cols-3">
              {["Mobile-ready", "Product-focused", "WhatsApp-friendly"].map((item) => (
                <div
                  key={item}
                  className="mobile-showcase-badge rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-bold text-white shadow-sm backdrop-blur-md"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="market-primary-button inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-bold text-white"
              >
                Create Business Page
              </Link>

              <Link
                href="/stores"
                className="mobile-showcase-secondary inline-flex items-center justify-center rounded-2xl border border-white/22 bg-white/10 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/16"
              >
                Explore Stores
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="mobile-showcase-media relative overflow-hidden rounded-[1.8rem] border border-white/16 bg-white/[0.06] p-4 shadow-[0_28px_95px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
              <Image
                src="/mobile.png"
                alt="Furniture business storefront preview on tablet and mobile"
                width={1100}
                height={760}
                className="w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.45)]"
              />
            </div>
          </div>
        </div>
      </section>

      <TestimonialsSection />
      <PlatformFooter />
    </main>
  );
}






