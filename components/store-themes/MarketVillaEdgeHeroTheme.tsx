import Image from "next/image";
import {
  ArrowRight,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

const products = [
  {
    name: "Hero Product",
    price: "₦12,500",
    tag: "Featured",
    description: "A product card for the first item customers should notice.",
  },
  {
    name: "Popular Item",
    price: "₦18,000",
    tag: "Popular",
    description: "Use this for best sellers, frequent orders, or common requests.",
  },
  {
    name: "Premium Package",
    price: "₦32,000",
    tag: "Premium",
    description: "Great for bundles, premium services, or high-value offers.",
  },
];

const navItems = ["Home", "Products", "About", "Contact"];

export function MarketVillaEdgeHeroTheme() {
  return (
    <main className="edge-hero-theme min-h-screen bg-[#eef6fb] text-[#0f172a]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.35rem] border border-[#d8e7f0] bg-white shadow-[0_20px_70px_rgba(15,23,42,0.1)]">
          <header className="border-b border-[#d8e7f0] bg-white px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#0f172a] text-[#bae6fd]">
                  <Store size={18} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[-0.02em] text-[#0f172a]">
                    Business Name
                  </p>
                  <p className="text-xs font-semibold text-[#0f172a]/55">
                    Edge hero storefront
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#0284c7] px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(2,132,199,0.2)]"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto border-t border-[#d8e7f0] pt-3 text-xs font-black uppercase tracking-[0.16em] text-[#0f172a]/55">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                  className="shrink-0 rounded-full px-3 py-1.5 transition hover:bg-[#e0f2fe] hover:text-[#0284c7]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </header>

          <section id="home" className="p-4 md:p-5">
            <div className="relative min-h-[260px] overflow-hidden rounded-[1.15rem] bg-[#0f172a] md:min-h-[315px]">
              <Image
                src="/main-hero.png"
                alt="Market Villa edge hero placeholder"
                fill
                sizes="100vw"
                className="object-cover"
                priority
              />

              <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,23,42,0.92),rgba(15,23,42,0.48),rgba(14,165,233,0.08))]" />

              <div className="relative z-10 flex min-h-[260px] items-end p-5 md:min-h-[315px] md:p-6">
                <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-white shadow-[0_18px_45px_rgba(15,23,42,0.22)] backdrop-blur-md">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-sky-100">
                    Hero image space
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="products" className="border-t border-[#d8e7f0] px-4 py-4 md:px-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#0284c7]">
                  Featured Products
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#0f172a]">
                  Products appear right after the hero.
                </h2>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#e0f2fe] px-4 py-2 text-xs font-black text-[#0369a1]"
              >
                Contact
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="rounded-[1.1rem] border border-[#d8e7f0] bg-[#f8fcff] p-3 shadow-[0_14px_45px_rgba(15,23,42,0.06)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#e0f2fe] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#0369a1]">
                      {product.tag}
                    </span>

                    <Package size={17} className="text-[#0284c7]" />
                  </div>

                  <div className="grid min-h-20 place-items-center rounded-2xl bg-[linear-gradient(135deg,#e0f2fe,#ffffff)]">
                    <ShoppingBag size={25} className="text-[#0f172a]" />
                  </div>

                  <h3 className="mt-3 text-sm font-black tracking-[-0.03em] text-[#0f172a]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-base font-black text-[#0284c7]">
                    {product.price}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#0f172a]/62">
                    {product.description}
                  </p>

                  <a
                    href="https://wa.me/"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0f172a] px-3 py-2 text-xs font-black text-white"
                  >
                    <MessageCircle size={14} />
                    Ask
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="border-t border-[#d8e7f0] px-4 py-4 md:px-5">
            <div className="grid gap-3 rounded-[1.1rem] bg-[#eef6fb] p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#0284c7]">
                  About this store
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#0f172a]/66">
                  Add a short brand story, delivery note, opening hours, or trust message here.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#0f172a]">
                  <ShieldCheck size={14} className="text-[#0284c7]" />
                  Trusted layout
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-bold text-[#0f172a]">
                  <ShoppingBag size={14} className="text-[#0284c7]" />
                  Products first
                </span>
              </div>
            </div>
          </section>
        </div>
      </section>

      <footer id="contact" className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-[#d8e7f0] bg-[#0f172a] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-white">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-sky-50/62">
              Footer area for business contact, location, operating hours, delivery notes, and customer support information.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-sky-50/72">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-sky-200" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-sky-200" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}