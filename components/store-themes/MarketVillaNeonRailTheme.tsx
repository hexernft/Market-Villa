import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  Boxes,
  MapPin,
  MessageCircle,
  Phone,
  ScanLine,
  ShoppingCart,
  Sparkles,
  Store,
  Zap,
} from "lucide-react";

const products = [
  {
    name: "Flash Product",
    price: "₦7,500",
    tag: "Hot",
    description: "A bold product slot for fast-moving offers and limited deals.",
  },
  {
    name: "Core Item",
    price: "₦13,000",
    tag: "Core",
    description: "Use this for your main product, service, package, or offer.",
  },
  {
    name: "Elite Pick",
    price: "₦29,000",
    tag: "Elite",
    description: "Best for premium items, featured bundles, or high-value products.",
  },
];

export function MarketVillaNeonRailTheme() {
  return (
    <main className="neon-rail-theme min-h-screen bg-[#050816] text-white">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.35rem] border border-cyan-300/20 bg-[#08111f] shadow-[0_24px_90px_rgba(34,211,238,0.12)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-cyan-300/10 bg-[#050816] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-300 text-[#050816] shadow-[0_0_30px_rgba(103,232,249,0.45)]">
                <Store size={18} />
              </div>

              <div>
                <p className="text-sm font-black tracking-[-0.02em] text-white">
                  Business Name
                </p>
                <p className="text-xs font-semibold text-cyan-100/55">
                  Neon rail storefront
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-xs font-black text-[#07110a] shadow-[0_0_28px_rgba(190,242,100,0.38)]"
            >
              <MessageCircle size={15} />
              Chat Now
            </a>
          </header>

          <section className="grid gap-3 p-4 md:grid-cols-[0.66fr_1.34fr] md:p-5">
            <div className="relative min-h-[280px] overflow-hidden rounded-[1.15rem] border border-cyan-300/15 bg-[#0b1729] p-5 md:min-h-[360px]">
              <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full bg-cyan-300/20 blur-3xl" />
              <div className="absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-lime-300/15 blur-3xl" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-200/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-cyan-100">
                  <Zap size={13} />
                  Neon Rail
                </span>

                <h1 className="mt-4 max-w-md text-[2.1rem] font-black leading-[0.95] tracking-[-0.07em] text-white md:text-[3.25rem]">
                  Fast products. Sharp layout. Instant action.
                </h1>

                <p className="mt-3 max-w-sm text-sm leading-6 text-cyan-50/68">
                  A darker, energetic store style for gadgets, fashion drops,
                  services, event vendors, and modern retail brands.
                </p>

                <div className="mt-5 grid gap-2">
                  <div className="flex items-center gap-3 rounded-2xl border border-cyan-200/20 bg-white/8 p-3">
                    <ScanLine
                      size={18}
                      className="shrink-0 text-cyan-200"
                      style={{ color: "#a5f3fc", stroke: "#a5f3fc" }}
                    />
                    <p
                      className="text-xs font-bold"
                      style={{
                        color: "rgba(236, 254, 255, 0.92)",
                        WebkitTextFillColor: "rgba(236, 254, 255, 0.92)",
                      }}
                    >
                      Products appear without long scrolling
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl border border-lime-200/20 bg-white/8 p-3">
                    <BadgeCheck
                      size={18}
                      className="shrink-0 text-lime-200"
                      style={{ color: "#d9f99d", stroke: "#d9f99d" }}
                    />
                    <p
                      className="text-xs font-bold"
                      style={{
                        color: "rgba(236, 254, 255, 0.92)",
                        WebkitTextFillColor: "rgba(236, 254, 255, 0.92)",
                      }}
                    >
                      Great for bold modern businesses
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative min-h-[175px] overflow-hidden rounded-[1.15rem] border border-cyan-300/15 bg-[#0d1b30]">
                <Image
                  src="/main-hero.png"
                  alt="Market Villa neon placeholder hero"
                  fill
                  sizes="(min-width: 768px) 62vw, 100vw"
                  className="object-cover opacity-70"
                  priority
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,22,0.88),rgba(5,8,22,0.28),rgba(34,211,238,0.12))]" />

                <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan-200/20 bg-[#050816]/78 p-3 shadow-[0_18px_55px_rgba(0,0,0,0.34)] backdrop-blur">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-cyan-200">
                      Hero placeholder
                    </p>
                    <p className="mt-1 text-sm font-black text-white">
                      Replace with your newest drop or top offer.
                    </p>
                  </div>

                  <div className="grid h-11 w-11 place-items-center rounded-2xl bg-lime-300 text-[#07110a]">
                    <Sparkles size={18} />
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.name}
                    className="group rounded-[1.05rem] border border-cyan-300/20 bg-[#08111f] p-3 shadow-[0_14px_50px_rgba(0,0,0,0.34)] transition hover:-translate-y-1 hover:border-cyan-200/45"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-cyan-200/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-100 ring-1 ring-cyan-200/20">
                        {product.tag}
                      </span>

                      <Boxes size={17} className="text-lime-200" />
                    </div>

                    <div className="grid min-h-20 place-items-center rounded-2xl bg-[radial-gradient(circle_at_top,#164e63,#08111f_70%)]">
                      <ShoppingCart size={25} className="text-cyan-100" />
                    </div>

                    <h3 className="mt-3 text-sm font-black tracking-[-0.03em] text-white">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-base font-black text-lime-200 drop-shadow-[0_0_12px_rgba(190,242,100,0.25)]">
                      {product.price}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-cyan-50/70">
                      {product.description}
                    </p>

                    <a
                      href="https://wa.me/"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-300 px-3 py-2 text-xs font-black text-[#050816] shadow-[0_0_22px_rgba(190,242,100,0.22)] transition hover:bg-cyan-200"
                    >
                      <MessageCircle size={14} />
                      Ask
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-cyan-300/15 bg-[#08111f] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-white">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-cyan-50/58">
              Add business details, delivery rules, opening hours, and a short
              reason customers should trust this store.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-cyan-50/68">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-cyan-200" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-lime-200" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}