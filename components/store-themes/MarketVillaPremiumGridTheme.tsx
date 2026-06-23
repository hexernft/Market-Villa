import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  Phone,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

const products = [
  {
    name: "Everyday Essential",
    price: "₦6,500",
    tag: "Fast seller",
    description: "A simple product highlight for items customers buy often.",
  },
  {
    name: "Signature Choice",
    price: "₦14,000",
    tag: "Recommended",
    description: "Use this for your strongest product, bundle, or main offer.",
  },
  {
    name: "Premium Package",
    price: "₦25,000",
    tag: "Best value",
    description: "Perfect for luxury items, service packages, or bulk orders.",
  },
];

export function MarketVillaPremiumGridTheme() {
  return (
    <main className="premium-grid-theme min-h-screen bg-[#faf7ff] text-[#1f1230]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.25rem] border border-[#e8ddff] bg-white shadow-[0_18px_65px_rgba(31,18,48,0.1)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#efe7ff] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#1f1230] text-white">
                <Store size={18} />
              </div>

              <div>
                <p className="text-sm font-black tracking-[-0.02em] text-[#1f1230]">
                  Business Name
                </p>
                <p className="text-xs font-medium text-[#1f1230]/60">
                  Premium storefront by Market Villa
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 rounded-full bg-[#f6f0ff] px-3 py-1.5 text-xs font-bold text-[#7c3aed] sm:inline-flex">
                <Clock3 size={13} />
                Open today
              </span>

              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#16a34a] px-4 py-2 text-xs font-black text-white shadow-[0_12px_28px_rgba(22,163,74,0.22)]"
              >
                <MessageCircle size={15} />
                Order
              </a>
            </div>
          </header>

          <section className="grid gap-4 p-4 md:grid-cols-[0.78fr_1.22fr] md:items-stretch md:p-5">
            <div className="flex min-h-[260px] flex-col justify-between rounded-[1.1rem] bg-[#1f1230] p-5 text-white md:min-h-[310px]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-white/70">
                  <Sparkles size={13} />
                  Premium Grid
                </span>

                <h1 className="mt-4 max-w-lg text-[2rem] font-black leading-[0.98] tracking-[-0.065em] text-white md:text-[3.35rem]">
                  Your best products, seen instantly.
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/75">
                  A compact business page layout where the hero stays slim and
                  the products appear immediately.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <ShoppingBag size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">Shop</p>
                </div>

                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <PackageCheck size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">Products</p>
                </div>

                <div className="rounded-2xl bg-white/12 p-3 text-white">
                  <MessageCircle size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">WhatsApp</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative min-h-[170px] overflow-hidden rounded-[1.1rem] bg-[#eadcff] md:min-h-[185px]">
                <Image
                  src="/main-hero.png"
                  alt="Market Villa placeholder hero"
                  fill
                  sizes="(min-width: 768px) 56vw, 100vw"
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(31,18,48,0.42),rgba(31,18,48,0.04))]" />

                <div className="absolute bottom-3 left-3 right-3 rounded-2xl bg-white/90 p-3 shadow-[0_16px_40px_rgba(31,18,48,0.16)] backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                    Hero placeholder
                  </p>
                  <p className="mt-1 text-sm font-black text-[#1f1230]">
                    Replace this with a featured item, brand photo, or service.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.name}
                    className="rounded-[1.05rem] border border-[#eee5ff] bg-[#fbf9ff] p-3 shadow-sm"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#7c3aed] ring-1 ring-[#eadcff]">
                        {product.tag}
                      </span>

                      <PackageCheck size={17} className="text-[#7c3aed]" />
                    </div>

                    <h3 className="text-sm font-black tracking-[-0.03em] text-[#1f1230]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-base font-black text-[#7c3aed]">
                      {product.price}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#1f1230]/58">
                      {product.description}
                    </p>

                    <a
                      href="https://wa.me/"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1f1230] px-3 py-2 text-xs font-black text-white"
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
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-[#e8ddff] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#1f1230]/58">
              Add business description, opening hours, delivery note, and a
              short trust message here.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-[#1f1230]/68">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-[#7c3aed]" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-[#7c3aed]" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}