import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  Sparkles,
  Store,
} from "lucide-react";

const placeholderProducts = [
  {
    name: "Signature Product",
    price: "₦12,000",
    category: "Featured",
    description: "A clean product card designed to show price, value, and action quickly.",
  },
  {
    name: "Customer Favourite",
    price: "₦8,500",
    category: "Popular",
    description: "Perfect for highlighting fast-moving items customers ask about often.",
  },
  {
    name: "Premium Offer",
    price: "₦18,000",
    category: "Premium",
    description: "Use this section for bundles, best sellers, or high-value offers.",
  },
];

export function MarketVillaCompactTheme() {
  return (
    <main className="compact-store-theme min-h-screen bg-[#f7f1ff] text-[#241436]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.4rem] border border-white/70 bg-white/85 shadow-[0_24px_80px_rgba(36,20,54,0.14)] backdrop-blur-xl">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#7c3aed]/10 px-4 py-3 md:px-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7c3aed] text-white">
                <Store size={19} />
              </span>

              <div>
                <p className="text-sm font-bold">Business Name</p>
                <p className="text-xs text-[#241436]/50">Powered by Market Villa</p>
              </div>
            </Link>

            <a
              href="https://wa.me/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#22c55e] px-4 py-2 text-xs font-bold text-white shadow-[0_12px_28px_rgba(34,197,94,0.22)]"
            >
              <MessageCircle size={15} />
              WhatsApp
            </a>
          </header>

          <section className="grid gap-4 p-4 md:grid-cols-[0.88fr_1.12fr] md:items-center md:p-5">
            <div className="rounded-[1.2rem] bg-[#241436] p-5 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">
                <Sparkles size={13} />
                New Storefront
              </span>

              <h1 className="mt-4 max-w-xl text-[2rem] font-semibold leading-[1.02] tracking-[-0.055em] md:text-[3rem]">
                A clean store page that sells fast.
              </h1>

              <p className="mt-3 max-w-lg text-sm leading-6 text-white/68">
                Show your best products, prices, contact details, and ordering action without making customers scroll too much.
              </p>

              <div className="mt-5 grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-3">
                  <Package size={17} />
                  <p className="mt-2 text-xs font-semibold">Products first</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <ShieldCheck size={17} />
                  <p className="mt-2 text-xs font-semibold">Trusted layout</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3">
                  <MessageCircle size={17} />
                  <p className="mt-2 text-xs font-semibold">WhatsApp-ready</p>
                </div>
              </div>
            </div>

            <div className="relative min-h-[230px] overflow-hidden rounded-[1.2rem] bg-[#eadcff] md:min-h-[285px]">
              <Image
                src="/main-hero.png"
                alt="Market Villa placeholder storefront"
                fill
                sizes="(min-width: 768px) 48vw, 100vw"
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,20,54,0.35),rgba(124,58,237,0.08))]" />

              <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/40 bg-white/85 p-3 shadow-[0_18px_50px_rgba(36,20,54,0.18)] backdrop-blur-xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7c3aed]">
                  Placeholder Hero Item
                </p>
                <p className="mt-1 text-sm font-bold text-[#241436]">
                  Replace this with your best product, service, or offer.
                </p>
              </div>
            </div>
          </section>
        </div>
      </section>

      <section className="px-4 pb-6 md:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#7c3aed]">
                Featured Products
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                Products customers see first.
              </h2>
            </div>

            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-full border border-[#7c3aed]/15 bg-white/80 px-4 py-2 text-xs font-bold text-[#241436] shadow-sm"
            >
              Contact Business
              <ArrowRight size={14} />
            </a>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {placeholderProducts.map((product, index) => (
              <article
                key={product.name}
                className="overflow-hidden rounded-[1.25rem] border border-white/75 bg-white shadow-[0_18px_55px_rgba(36,20,54,0.1)]"
              >
                <div className="relative grid min-h-[135px] place-items-center bg-[linear-gradient(135deg,#efe3ff,#ffffff)]">
                  <div className="grid h-20 w-20 place-items-center rounded-[1.4rem] bg-[#7c3aed] text-white shadow-[0_16px_35px_rgba(124,58,237,0.24)]">
                    <Package size={26} />
                  </div>

                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold text-[#7c3aed]">
                    {product.category}
                  </span>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold tracking-[-0.03em]">
                      {product.name}
                    </h3>
                    <p className="shrink-0 text-sm font-black text-[#7c3aed]">
                      {product.price}
                    </p>
                  </div>

                  <p className="mt-2 text-sm leading-6 text-[#241436]/62">
                    {product.description}
                  </p>

                  <a
                    href="https://wa.me/"
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#241436] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#321b52]"
                  >
                    <MessageCircle size={15} />
                    Ask on WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer id="contact" className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-[1.25rem] border border-white/75 bg-white/80 p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-bold">Business Name</p>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#241436]/60">
              A simple footer area for business location, contact details, opening hours, and short trust message.
            </p>
          </div>

          <div className="grid gap-2 text-sm text-[#241436]/70">
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