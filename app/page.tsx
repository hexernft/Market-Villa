import { TestimonialsSection } from "@/components/TestimonialsSection";
﻿import Link from "next/link";
import { ArrowRight, CheckCircle2, Globe2, MessageCircle, Store } from "lucide-react";
import { PlatformNavbar } from "@/components/PlatformNavbar";
import { PlatformFooter } from "@/components/PlatformFooter";
import { HeroImageCarousel } from "@/components/HeroImageCarousel";
import { MotionReveal } from "@/components/MotionReveal";

const features = [
  { title: "A polished business page", description: "Give customers one clean place to view your brand, offers, contact details, and order options.", icon: Store },
  { title: "WhatsApp-ready selling", description: "Customers can browse your page and start a clear order or inquiry conversation on WhatsApp.", icon: MessageCircle },
  { title: "Custom domain option", description: "Upgrade from a Market Villa link to a professional domain when the business is ready.", icon: Globe2 },
];

const faqItems = [
  { question: "Do I need technical skills?", answer: "No. Market Villa is built so a business owner can create and manage a simple page without writing code." },
  { question: "Can customers order through the page?", answer: "Yes. Customers can view your products or services and start a clear WhatsApp order or inquiry." },
  { question: "Can I use my own domain?", answer: "Yes. Custom domain setup can be requested as an add-on when the business is ready." },
  { question: "What kind of businesses can use Market Villa?", answer: "Food vendors, fashion brands, beauty businesses, apartments, retail stores, and service providers can all use it." },
];

export default function Home() {
  return (
    <main className="mv-page-shell min-h-screen text-[#241436]">
      <PlatformNavbar />

      <section className="mv-lavender-hero px-4 pb-10 pt-28 md:px-4 md:pb-14 md:pt-32">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[2.3rem] border border-white/65 bg-white/38 p-5 shadow-[0_28px_90px_rgba(55,31,83,0.13)] backdrop-blur-2xl md:p-7 lg:p-8">
          <div className="grid gap-10 lg:grid-cols-[0.92fr_0.78fr] lg:items-center">
            <MotionReveal>
              <div className="mb-6 inline-flex rounded-full border border-[#7c3aed]/12 bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#7c3aed]">
                Designed to delight. Built to sell.
              </div>
              <h1 className="max-w-2xl text-[2.85rem] font-semibold leading-[1.03] text-[#241436] md:text-[4.2rem]">
                Start simple. Look professional. Sell with confidence.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-[#241436]/68">
                Create a clean business page in minutes, add your details, and share your link with customers.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="/login" className="market-primary-button inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold text-white">
                  Create Business Page
                  <ArrowRight size={16} />
                </Link>
                <Link href="/stores" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#7c3aed]/15 bg-white/55 px-4 py-2.5 text-sm font-semibold text-[#241436] shadow-sm hover:bg-white/80">
                  Explore Stores
                </Link>
              </div>
            </MotionReveal>
            <HeroImageCarousel />
          </div>
        </div>
      </section>

      <section id="how" className="px-4 py-10 md:px-4">
        <div className="mx-auto max-w-7xl">
          <MotionReveal>
            <h2 className="text-center text-2xl font-semibold text-[#241436] md:text-2xl">Powerful tools. Beautiful results.</h2>
          </MotionReveal>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <MotionReveal key={feature.title} delay={index * 0.08}>
                  <div className="mv-soft-panel premium-card-hover rounded-[1.6rem] p-5">
                    <div className="mb-5 grid h-10 w-12 place-items-center rounded-[1.15rem] bg-[#f0e7ff] text-[#7c3aed] ring-1 ring-[#7c3aed]/12">
                      <Icon size={19} />
                    </div>
                    <h3 className="text-sm font-semibold text-[#241436]">{feature.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[#241436]/62">{feature.description}</p>
                  </div>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-4 py-8 md:px-4">
        <div className="mx-auto grid max-w-7xl gap-5 rounded-[2rem] bg-[linear-gradient(160deg,#241436,#321b4d_70%,#412064)] p-6 text-white shadow-[0_28px_70px_rgba(36,20,54,0.22)] lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/55">Why Market Villa</p>
            <h2 className="mt-3 text-2xl font-semibold text-white md:text-2xl">A simple page before the WhatsApp conversation.</h2>
          </div>
          <div className="grid gap-3">
            {[
              "Customers see your business clearly before messaging.",
              "Products and services stay organized in one place.",
              "Business owners can keep their page updated anytime.",
            ].map((item, index) => (
              <MotionReveal key={item} delay={index * 0.08} direction="right">
                <div className="flex gap-3 rounded-[1.35rem] border border-white/10 bg-white/8 p-4 backdrop-blur">
                  <CheckCircle2 size={17} className="mt-1 shrink-0 text-[#c4b5fd]" />
                  <p className="text-sm leading-6 text-white/72">{item}</p>
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
          <div className="mv-soft-panel overflow-hidden rounded-[1.8rem]">
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
          <span className="mx-5">Market Villa helps businesses create clean pages, organize products and services, receive WhatsApp inquiries, and look more trusted online.</span>
          <span className="mx-5">Simple business pages. Smart storefronts. WhatsApp-ready selling. Custom domain support. Built for small businesses.</span>
          <span className="mx-5">Market Villa helps businesses create clean pages, organize products and services, receive WhatsApp inquiries, and look more trusted online.</span>
          <span className="mx-5">Simple business pages. Smart storefronts. WhatsApp-ready selling. Custom domain support. Built for small businesses.</span>
        </div>
      </section>
      <TestimonialsSection />
      <PlatformFooter />
    </main>
  );
}


