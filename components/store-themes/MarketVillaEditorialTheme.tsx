import Image from "next/image";
import {
  ArrowRight,
  Crown,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
  Store,
} from "lucide-react";

const products = [
  {
    name: "Editorial Pick",
    price: "₦11,500",
    tag: "Featured",
    description: "A clean product card for highlighted items and curated offers.",
  },
  {
    name: "Signature Item",
    price: "₦19,000",
    tag: "Signature",
    description: "Use this for your strongest product, service, or bundle.",
  },
  {
    name: "Limited Offer",
    price: "₦27,500",
    tag: "Limited",
    description: "Perfect for premium offers, seasonal drops, or special packages.",
  },
];

const navItems = ["Home", "Products", "About", "Contact"];

export function MarketVillaEditorialTheme() {
  return (
    <main className="editorial-store-theme min-h-screen bg-[#f7f1e8] text-[#201711]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.35rem] border border-[#e8dccb] bg-[#fffaf2] shadow-[0_20px_70px_rgba(32,23,17,0.1)]">
          <header className="border-b border-[#eadfce] px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-[#201711] text-[#f8d991]">
                  <Store size={18} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[-0.02em] text-[#201711]">
                    Business Name
                  </p>
                  <p className="text-xs font-semibold text-[#201711]/55">
                    Editorial storefront
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#201711] px-4 py-2 text-xs font-black text-[#fffaf2] shadow-[0_12px_30px_rgba(32,23,17,0.18)]"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto border-t border-[#eadfce] pt-3 text-xs font-black uppercase tracking-[0.16em] text-[#201711]/58">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                  className="shrink-0 rounded-full px-3 py-1.5 transition hover:bg-[#f0e4d4] hover:text-[#201711]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </header>

          <section id="home" className="grid gap-4 p-4 md:grid-cols-[0.92fr_1.08fr] md:items-stretch md:p-5">
            <div className="flex min-h-[255px] flex-col justify-between rounded-[1.15rem] bg-[#201711] p-5 text-[#fffaf2] md:min-h-[315px]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#f8d991]/12 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#f8d991]">
                  <Crown size={13} />
                  Editorial Store
                </span>

                <h1 className="mt-4 max-w-lg text-[2.1rem] font-black leading-[0.96] tracking-[-0.065em] text-[#fffaf2] md:text-[3.3rem]">
                  A polished shop page with a magazine feel.
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#fffaf2]/72">
                  Minimal, premium, and focused. A compact storefront for brands that want products and story to feel refined.
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-xs font-bold text-[#fffaf2]/84">
                  <Sparkles size={14} />
                  Premium layout
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/8 px-3 py-2 text-xs font-bold text-[#fffaf2]/84">
                  <ShoppingBag size={14} />
                  Products first
                </span>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative min-h-[175px] overflow-hidden rounded-[1.15rem] border border-[#eadfce] bg-[#e9dccb] md:min-h-[190px]">
                <Image
                  src="/main-hero.png"
                  alt="Market Villa editorial placeholder hero"
                  fill
                  sizes="(min-width: 768px) 54vw, 100vw"
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(32,23,17,0.54),rgba(32,23,17,0.08))]" />

                <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/50 bg-[#fffaf2]/90 p-3 shadow-[0_16px_40px_rgba(32,23,17,0.14)] backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8b5e25]">
                    Hero placeholder
                  </p>
                  <p className="mt-1 text-sm font-black text-[#201711]">
                    Replace this with a premium product shot, brand photo, or featured offer.
                  </p>
                </div>
              </div>

              <div id="products" className="grid gap-3 md:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.name}
                    className="rounded-[1.05rem] border border-[#eadfce] bg-[#fffdf8] p-3 shadow-[0_14px_40px_rgba(32,23,17,0.06)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#f3e7d6] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#8b5e25]">
                        {product.tag}
                      </span>

                      <Package size={17} className="text-[#8b5e25]" />
                    </div>

                    <div className="grid min-h-20 place-items-center rounded-2xl bg-[#f2e7d8]">
                      <ShoppingBag size={25} className="text-[#201711]" />
                    </div>

                    <h3 className="mt-3 text-sm font-black tracking-[-0.03em] text-[#201711]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-base font-black text-[#8b5e25]">
                      {product.price}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#201711]/62">
                      {product.description}
                    </p>

                    <a
                      href="https://wa.me/"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#201711] px-3 py-2 text-xs font-black text-[#fffaf2]"
                    >
                      <MessageCircle size={14} />
                      Ask
                    </a>
                  </article>
                ))}
              </div>
            </div>
          </section>

          <section id="about" className="border-t border-[#eadfce] px-4 py-4 md:px-5">
            <div className="grid gap-3 rounded-[1.1rem] bg-[#f4eadc] p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#8b5e25]">
                  About this business
                </p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#201711]/68">
                  Add a short brand story, delivery note, opening hours, or trust message here.
                </p>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#fffaf2] px-4 py-2 text-xs font-black text-[#201711] ring-1 ring-[#eadfce]"
              >
                Contact
                <ArrowRight size={14} />
              </a>
            </div>
          </section>
        </div>
      </section>

      <footer id="contact" className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-[#eadfce] bg-[#201711] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-[#fffaf2]">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#fffaf2]/62">
              Footer space for business contact details, address, opening hours, and customer support note.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-[#fffaf2]/72">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-[#f8d991]" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-[#f8d991]" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}