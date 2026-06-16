"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Globe2,
  MessageCircle,
  PackageCheck,
  Paintbrush,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
} from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { MotionReveal } from "@/components/MotionReveal";

const businessTypes = [
  {
    id: "fashion",
    label: "Fashion",
    image: "/sleekstitch-luxury.png",
    store: "SleekStitch Atelier",
    category: "Custom clothing",
    headline: "A tailored storefront for premium pieces.",
    description:
      "Show collections, prices, measurements, and client-ready order notes before the first WhatsApp message.",
    product: "Sleek Executive Fit",
    price: "₦85,000",
    location: "Lekki, Lagos",
    accent: "#f59e0b",
  },
  {
    id: "food",
    label: "Food",
    image: "/thrift-store.png",
    store: "Villa Bites",
    category: "Meals and catering",
    headline: "A clear menu for daily orders and weekend trays.",
    description:
      "Organize meals, delivery notes, order windows, and package options in a way customers can scan fast.",
    product: "Family Jollof Tray",
    price: "₦24,500",
    location: "Wuse, Abuja",
    accent: "#10b981",
  },
  {
    id: "beauty",
    label: "Beauty",
    image: "/african-fashion-atelier.png",
    store: "Glow Room Studio",
    category: "Beauty services",
    headline: "Turn services into a polished booking page.",
    description:
      "Present services, proof photos, opening hours, and consultation prompts without sending scattered screenshots.",
    product: "Bridal Glow Session",
    price: "₦45,000",
    location: "GRA, Port Harcourt",
    accent: "#ec4899",
  },
  {
    id: "retail",
    label: "Retail",
    image: "/phone-shop.png",
    store: "Gadget Lane",
    category: "Phones and accessories",
    headline: "Make product discovery feel organized.",
    description:
      "Give shoppers a neat view of available items, prices, pickup options, and direct inquiry buttons.",
    product: "MagSafe Power Bank",
    price: "₦32,000",
    location: "Ikeja, Lagos",
    accent: "#06b6d4",
  },
];

const storefrontTabs = [
  {
    id: "products",
    label: "Products",
    icon: ShoppingBag,
    title: "Featured products",
    detail: "Add prices, stock notes, images, and clear inquiry buttons.",
  },
  {
    id: "services",
    label: "Services",
    icon: PackageCheck,
    title: "Services and packages",
    detail: "List packages, delivery areas, booking rules, and custom requests.",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: Star,
    title: "Customer proof",
    detail: "Make trust visible with testimonials and business highlights.",
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: MessageCircle,
    title: "Ready-to-send orders",
    detail: "Customers start with a clean product message instead of a vague hello.",
  },
];

const launchSteps = [
  {
    title: "Add business details",
    text: "Name, category, location, contact details, opening hours, and brand story.",
    icon: Store,
  },
  {
    title: "Upload products or services",
    text: "Give customers enough detail to decide before messaging.",
    icon: Paintbrush,
  },
  {
    title: "Share your link",
    text: "Send one polished page across WhatsApp, Instagram, TikTok, and flyers.",
    icon: ExternalLink,
  },
];

const proofCards = [
  { label: "Launch flow", value: 3, suffix: " steps", icon: Clock3 },
  { label: "Customer channels", value: 5, suffix: "+", icon: Globe2 },
  { label: "WhatsApp-ready", value: 100, suffix: "%", icon: MessageCircle },
  { label: "Page control", value: 24, suffix: "/7", icon: ShieldCheck },
];

export function HomeCommerceExperiences() {
  const [activeType, setActiveType] = useState(businessTypes[0]);
  const [activeTab, setActiveTab] = useState(storefrontTabs[0]);
  const [activeStep, setActiveStep] = useState(0);

  const whatsappMessage = useMemo(
    () =>
      `Hello ${activeType.store}, I found ${activeType.product} on Market Villa. Is it available?`,
    [activeType],
  );

  return (
    <>
      <section className="home-commerce-experiences px-4 py-10 md:px-4">
        <MotionReveal>
          <div className="home-showcase-card mx-auto grid max-w-7xl gap-6 overflow-hidden rounded-[2rem] border border-white/70 bg-white/70 p-5 shadow-[0_30px_90px_rgba(36,20,54,0.18)] backdrop-blur-2xl lg:grid-cols-[0.72fr_1.28fr] lg:p-7">
            <div className="home-dark-panel flex flex-col justify-between gap-8 rounded-[1.5rem] bg-[#12051f] p-5 text-white md:p-7">
              <div>
                <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
                  <Sparkles size={14} />
                  Storefront simulator
                </p>
                <h2 className="mt-4 text-3xl font-semibold leading-[1.02] text-white md:text-5xl">
                  See how different businesses show up.
                </h2>
                <p className="mt-4 text-sm leading-7 text-white/70">
                  Switch the business type and watch the page preview, product, and WhatsApp order message adjust.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {businessTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActiveType(type)}
                    className={`flex items-center justify-center rounded-2xl border px-3 py-3 text-sm font-bold transition ${
                      activeType.id === type.id
                        ? "border-white/70 bg-white text-[#241436]"
                        : "border-white/12 bg-white/7 text-white/74 hover:bg-white/12 hover:text-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="relative min-h-[430px] overflow-hidden rounded-[1.65rem] bg-[#241436]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeType.id}
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0"
                  >
                    <Image
                      src={activeType.image}
                      alt={`${activeType.store} storefront preview`}
                      fill
                      sizes="(min-width: 1024px) 32vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,0,8,0.08),rgba(5,0,8,0.72))]" />
                  </motion.div>
                </AnimatePresence>

                <div className="home-dark-panel absolute inset-x-4 bottom-4 rounded-[1.35rem] border border-white/18 bg-black/38 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/55">
                        {activeType.category}
                      </p>
                      <h3 className="mt-1 text-2xl font-semibold text-white">
                        {activeType.store}
                      </h3>
                      <p className="mt-1 text-xs text-white/62">{activeType.location}</p>
                    </div>
                    <span
                      className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-white"
                      style={{ background: activeType.accent }}
                    >
                      <Store size={19} />
                    </span>
                  </div>
                </div>
              </div>

              <div className="home-light-panel rounded-[1.65rem] border border-[#7c3aed]/12 bg-white/82 p-4 shadow-[0_20px_70px_rgba(36,20,54,0.12)]">
                <div className="flex items-center gap-2 border-b border-[#7c3aed]/10 pb-3">
                  <span className="h-3 w-3 rounded-full bg-[#ef4444]" />
                  <span className="h-3 w-3 rounded-full bg-[#f59e0b]" />
                  <span className="h-3 w-3 rounded-full bg-[#22c55e]" />
                  <span className="ml-2 truncate text-xs font-bold text-[#241436]/48">
                    marketvilla.app/{activeType.store.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${activeType.id}-${activeTab.id}`}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.28 }}
                    className="pt-5"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#7c3aed]">
                      {activeType.category}
                    </p>
                    <h3 className="mt-2 text-3xl font-semibold leading-[1.02] text-[#241436]">
                      {activeType.headline}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#241436]/68">
                      {activeType.description}
                    </p>

                    <div className="mt-5 rounded-[1.25rem] border border-[#7c3aed]/12 bg-[#f8f4ff] p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-sm font-bold text-[#241436]">{activeType.product}</p>
                          <p className="mt-1 text-xs text-[#241436]/58">{activeTab.detail}</p>
                        </div>
                        <p className="font-bold text-[#7c3aed]">{activeType.price}</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {storefrontTabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
                          activeTab.id === tab.id
                            ? "border-[#7c3aed]/28 bg-[#241436] text-white"
                            : "border-[#7c3aed]/12 bg-white/65 text-[#241436]/70 hover:bg-white"
                        }`}
                      >
                        <Icon size={15} />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </MotionReveal>
      </section>

      <section className="home-commerce-experiences px-4 py-10 md:px-4">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <MotionReveal>
            <div className="home-dark-panel home-showcase-card overflow-hidden rounded-[2rem] border border-white/70 bg-[#12051f] p-5 text-white shadow-[0_30px_90px_rgba(36,20,54,0.22)] md:p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#c4b5fd]">
                    WhatsApp order demo
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white md:text-5xl">
                    Turn browsing into a ready message.
                  </h2>
                </div>
                <MessageCircle size={34} className="text-[#22c55e]" />
              </div>

              <div className="mt-7 grid gap-4 md:grid-cols-[0.82fr_1.18fr] md:items-end">
                <div className="home-dark-panel rounded-[1.5rem] border border-white/12 bg-white/8 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/48">
                    Selected item
                  </p>
                  <p className="mt-3 text-xl font-semibold text-white">{activeType.product}</p>
                  <p className="mt-1 text-sm text-[#c4b5fd]">{activeType.price}</p>
                  <button
                    type="button"
                    className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#22c55e] px-4 py-3 text-sm font-bold text-white"
                  >
                    <MessageCircle size={16} />
                    Order on WhatsApp
                  </button>
                </div>

                <div className="home-light-panel rounded-[1.5rem] border border-white/12 bg-white p-4 text-[#241436]">
                  <div className="mb-4 flex items-center gap-2 border-b border-[#7c3aed]/10 pb-3">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-[#22c55e] text-white">
                      <MessageCircle size={17} />
                    </span>
                    <div>
                      <p className="text-sm font-bold">{activeType.store}</p>
                      <p className="text-xs text-[#241436]/48">Usually replies in minutes</p>
                    </div>
                  </div>
                  <motion.div
                    key={whatsappMessage}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="ml-auto max-w-[92%] rounded-[1.25rem] bg-[#dcfce7] p-4 text-sm leading-7 text-[#14532d]"
                  >
                    {whatsappMessage}
                  </motion.div>
                  <div className="mt-4 flex items-center gap-2 rounded-full bg-[#f8f4ff] px-4 py-2 text-xs font-semibold text-[#241436]/54">
                    <CheckCircle2 size={14} className="text-[#22c55e]" />
                    Product name, store name, and intent arrive together.
                  </div>
                </div>
              </div>
            </div>
          </MotionReveal>

          <MotionReveal delay={0.08} direction="right">
            <div className="home-light-panel home-showcase-card h-full rounded-[2rem] border border-white/70 bg-white/74 p-5 shadow-[0_30px_90px_rgba(36,20,54,0.16)] backdrop-blur-2xl md:p-7">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">
                AI helper
              </p>
              <div className="mt-4 flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#241436] text-white">
                  <Bot size={22} />
                </span>
                <div>
                  <h2 className="text-3xl font-semibold leading-[1.05] text-[#241436] md:text-4xl">
                    Help business owners sound ready.
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-[#241436]/66">
                    Position your AI as a practical assistant for store bios, product descriptions, service packages, and WhatsApp replies.
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-[#7c3aed]/12 bg-[#f8f4ff] p-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#7c3aed]">
                  <Search size={15} />
                  Prompt
                </div>
                <p className="mt-3 text-sm leading-7 text-[#241436]/78">
                  Write a short premium product description for {activeType.product}, then create a friendly WhatsApp reply for interested customers.
                </p>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-[#241436]/10 bg-white/70 p-4">
                <p className="text-sm font-bold text-[#241436]">Suggested output</p>
                <p className="mt-2 text-sm leading-7 text-[#241436]/64">
                  A polished description, a price-aware inquiry response, and a next-step message the owner can paste instantly.
                </p>
              </div>
            </div>
          </MotionReveal>
        </div>
      </section>

      <section className="home-commerce-experiences px-4 py-10 md:px-4">
        <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <MotionReveal>
            <div className="home-light-copy">
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">
                Build fast
              </p>
              <h2 className="mt-3 text-3xl font-semibold leading-[1.04] text-[#241436] md:text-5xl">
                A simple launch path customers can understand.
              </h2>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#241436]/66">
                Keep the story practical: owners add their details, organize their offers, then share a professional link.
              </p>
            </div>
          </MotionReveal>

          <div className="grid gap-3">
            {launchSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = activeStep === index;
              return (
                <MotionReveal key={step.title} delay={index * 0.07} direction="right">
                  <button
                    type="button"
                    onClick={() => setActiveStep(index)}
                    className={`home-mini-card flex w-full items-center gap-4 rounded-[1.5rem] border p-4 text-left transition ${
                      isActive
                        ? "border-[#7c3aed]/24 bg-[#241436] text-white shadow-[0_22px_70px_rgba(36,20,54,0.24)]"
                        : "border-white/70 bg-white/70 text-[#241436] shadow-[0_14px_45px_rgba(36,20,54,0.10)]"
                    }`}
                  >
                    <span
                      className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${
                        isActive ? "bg-white text-[#241436]" : "bg-[#f0e7ff] text-[#7c3aed]"
                      }`}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-bold uppercase tracking-[0.2em] opacity-60">
                        0{index + 1}
                      </span>
                      <span className="mt-1 block text-lg font-bold">{step.title}</span>
                      <span className={`mt-1 block text-sm leading-6 ${isActive ? "text-white/68" : "text-[#241436]/62"}`}>
                        {step.text}
                      </span>
                    </span>
                    <ArrowRight size={18} className={isActive ? "text-white/72" : "text-[#7c3aed]"} />
                  </button>
                </MotionReveal>
              );
            })}
          </div>
        </div>
      </section>

      <section className="home-commerce-experiences px-4 py-10 md:px-4">
        <div className="mx-auto grid max-w-7xl gap-4 md:grid-cols-4">
          {proofCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <MotionReveal key={card.label} delay={index * 0.05}>
                <div className="home-lift-card rounded-[1.6rem] border border-white/70 bg-white/72 p-5 text-[#241436] shadow-[0_20px_60px_rgba(36,20,54,0.12)] backdrop-blur-2xl">
                  <div className="mb-6 flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#241436] text-white">
                      <Icon size={18} />
                    </span>
                    <Truck size={18} className="text-[#7c3aed]/45" />
                  </div>
                  <p className="text-4xl font-semibold tracking-[-0.06em]">
                    <AnimatedNumber value={card.value} suffix={card.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-semibold text-[#241436]/58">{card.label}</p>
                </div>
              </MotionReveal>
            );
          })}
        </div>
      </section>
    </>
  );
}
