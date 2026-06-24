import Image from "next/image";
import {
  ArrowRight,
  BadgeCheck,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

const carouselItems = [
  {
    label: "Featured",
    title: "Your best offer, shown first.",
    description: "Use the carousel to highlight new arrivals, best sellers, or seasonal offers.",
  },
  {
    label: "Trusted",
    title: "A storefront that feels active.",
    description: "Rotate between products, services, brand messages, and customer-focused actions.",
  },
  {
    label: "Ready",
    title: "Customers can act quickly.",
    description: "Products are visible immediately, with WhatsApp actions placed close to the offer.",
  },
];

const products = [
  {
    name: "Carousel Feature",
    price: "₦10,500",
    tag: "Featured",
    description: "A clean slot for a product, service, or offer you want customers to notice first.",
  },
  {
    name: "Popular Choice",
    price: "₦17,000",
    tag: "Popular",
    description: "Use this for items customers often ask for or purchase repeatedly.",
  },
  {
    name: "Premium Set",
    price: "₦30,000",
    tag: "Premium",
    description: "Perfect for bundles, special orders, packages, or high-value products.",
  },
];

const navItems = ["Home", "Products", "About", "Contact"];

export function MarketVillaCarouselShowcaseTheme() {
  return (
    <main className="carousel-showcase-theme min-h-screen bg-[#f6f0ff] text-[#241436]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.4rem] border border-[#e2d2ff] bg-white shadow-[0_24px_80px_rgba(36,20,54,0.14)] backdrop-blur-xl">
          <header className="border-b border-[#7c3aed]/10 px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#7c3aed] text-white shadow-[0_12px_30px_rgba(124,58,237,0.24)]">
                  <Store size={18} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[-0.02em] text-[#241436]">
                    Business Name
                  </p>
                  <p className="text-xs font-semibold text-[#241436]/68">
                    Carousel showcase storefront
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#241436] px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(36,20,54,0.2)]"
              >
                <MessageCircle size={15} />
                WhatsApp
              </a>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto border-t border-[#7c3aed]/10 pt-3 text-xs font-black uppercase tracking-[0.16em] text-[#241436]/65">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                  className="shrink-0 rounded-full px-3 py-1.5 transition hover:bg-[#efe5ff] hover:text-[#7c3aed]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </header>

          <section id="home" className="grid gap-4 p-4 md:grid-cols-[1.1fr_0.9fr] md:items-stretch md:p-5">
            <div className="relative min-h-[315px] overflow-hidden rounded-[1.2rem] bg-[#241436] text-white md:min-h-[360px]">
              <div className="absolute inset-0">
                {carouselItems.map((item, index) => (
                  <div
                    key={item.title}
                    className="carousel-showcase-slide absolute inset-0"
                    style={{ animationDelay: `${index * 5}s` }}
                  >
                    <Image
                      src="/main-hero.png"
                      alt={item.title}
                      fill
                      sizes="(min-width: 768px) 58vw, 100vw"
                      className="object-cover opacity-45"
                      priority={index === 0}
                    />

                    <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(36,20,54,0.94),rgba(36,20,54,0.58),rgba(124,58,237,0.14))]" />

                    <div className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">

                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href="#products"
                          className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#241436]"
                        >
                          View Products
                          <ArrowRight size={14} />
                        </a>

                        <a
                          href="https://wa.me/"
                          className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-black text-white"
                        >
                          <MessageCircle size={14} />
                          Ask Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
                {carouselItems.map((item) => (
                  <span
                    key={item.title}
                    className="h-1.5 w-7 rounded-full bg-white/45"
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              <div className="rounded-[1.2rem] border border-[#e2d2ff] bg-[#f8f3ff] p-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-[#7c3aed]/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                  <Star size={13} />
                  Store Highlights
                </span>

                <h2 className="mt-4 text-2xl font-black leading-tight tracking-[-0.05em] text-[#241436]">
                  A homepage that feels alive without taking too much space.
                </h2>

                <p className="mt-3 text-sm leading-6 text-[#241436]/68">
                  This theme uses a rotating hero while keeping products visible immediately beside or below it.
                </p>

                <div className="mt-4 grid gap-2">
                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <BadgeCheck size={17} className="text-[#7c3aed]" />
                    <p className="text-xs font-bold text-[#241436]/76">
                      Great for promos and featured offers
                    </p>
                  </div>

                  <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <ShoppingBag size={17} className="text-[#7c3aed]" />
                    <p className="text-xs font-bold text-[#241436]/76">
                      Product cards appear at first glance
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.2rem] bg-[#241436] p-4 text-white">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#ffd166]">
                  Placeholder Hero Item
                </p>
                <p className="mt-2 text-sm font-bold text-white/84">
                  Replace carousel images and text with real product photos, announcements, or offers.
                </p>
              </div>
            </div>
          </section>

          <section id="products" className="border-t border-[#7c3aed]/10 px-4 py-4 md:px-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#7c3aed]">
                  Featured Products
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#241436]">
                  Products visible immediately.
                </h2>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#efe5ff] px-4 py-2 text-xs font-black text-[#7c3aed]"
              >
                Contact
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="rounded-[1.1rem] border border-[#e2d2ff] bg-white p-3 shadow-[0_14px_45px_rgba(36,20,54,0.08)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#efe5ff] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#7c3aed]">
                      {product.tag}
                    </span>

                    <Package size={17} className="text-[#7c3aed]" />
                  </div>

                  <div className="grid min-h-20 place-items-center rounded-2xl bg-[linear-gradient(135deg,#efe5ff,#ffffff)]">
                    <ShoppingBag size={25} className="text-[#241436]" />
                  </div>

                  <h3 className="mt-3 text-sm font-black tracking-[-0.03em] text-[#241436]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-base font-black text-[#7c3aed]">
                    {product.price}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#241436]/68">
                    {product.description}
                  </p>

                  <a
                    href="https://wa.me/"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#241436] px-3 py-2 text-xs font-black text-white shadow-[0_12px_28px_rgba(36,20,54,0.18)]"
                  >
                    <MessageCircle size={14} />
                    Ask
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="border-t border-[#7c3aed]/10 px-4 py-4 md:px-5">
            <div className="rounded-[1.1rem] bg-[#f8f3ff] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
                About this store
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#241436]/68">
                Add a short brand story, delivery note, opening hours, or customer trust message here.
              </p>
            </div>
          </section>
        </div>
      </section>

      <footer id="contact" className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-[#e2d2ff] bg-white p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-[#241436]">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#241436]/68">
              Footer area for business contact, location, operating hours, and customer support information.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-[#241436]/76">
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