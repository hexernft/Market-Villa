import Image from "next/image";
import {
  ArrowRight,
  Baby,
  Heart,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
} from "lucide-react";

const products = [
  {
    name: "Tiny Baby Set",
    price: "₦9,500",
    tag: "Cute Pick",
    description: "Perfect for baby clothes, soft items, gift packs, or newborn essentials.",
  },
  {
    name: "Little Joy Bundle",
    price: "₦16,000",
    tag: "Popular",
    description: "A playful card for bundles, toys, baby care products, or kids packages.",
  },
  {
    name: "Premium Baby Box",
    price: "₦28,000",
    tag: "Gift Box",
    description: "Use this for premium baby hampers, birthday packs, or special orders.",
  },
];

const navItems = ["Home", "Products", "About", "Contact"];

export function MarketVillaBabyBloomTheme() {
  return (
    <main className="baby-bloom-theme min-h-screen bg-[#fff1f8] text-[#3b1020]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.6rem] border border-[#ffd6e8] bg-[#fffafd] shadow-[0_24px_80px_rgba(236,72,153,0.13)]">
          <header className="border-b border-[#ffd6e8] bg-[#fffafd] px-4 py-3 md:px-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-[1.2rem] bg-[#ec4899] text-white shadow-[0_14px_30px_rgba(236,72,153,0.28)]">
                  <Baby size={20} />
                </div>

                <div>
                  <p className="text-sm font-black tracking-[-0.02em] text-[#3b1020]">
                    Baby Store Name
                  </p>
                  <p className="text-xs font-semibold text-[#3b1020]/55">
                    Cute baby storefront
                  </p>
                </div>
              </div>

              <a
                href="https://wa.me/"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ec4899] px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(236,72,153,0.24)] transition hover:-translate-y-0.5 hover:bg-[#db2777]"
              >
                <MessageCircle size={15} />
                Chat
              </a>
            </div>

            <nav className="mt-3 flex gap-2 overflow-x-auto border-t border-[#ffd6e8] pt-3 text-xs font-black uppercase tracking-[0.16em] text-[#3b1020]/52">
              {navItems.map((item) => (
                <a
                  key={item}
                  href={item === "Home" ? "#" : `#${item.toLowerCase()}`}
                  className="shrink-0 rounded-full px-3 py-1.5 transition hover:bg-[#ffe4f1] hover:text-[#db2777]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </header>

          <section id="home" className="grid gap-4 p-4 md:grid-cols-[0.85fr_1.15fr] md:items-stretch md:p-5">
            <div className="relative flex min-h-[265px] flex-col justify-between overflow-hidden rounded-[1.35rem] bg-[#fce7f3] p-5 md:min-h-[320px]">
              <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#f9a8d4]/55 blur-2xl" />
              <div className="absolute -bottom-12 -left-10 h-36 w-36 rounded-full bg-[#c4b5fd]/45 blur-2xl" />

              <div className="relative z-10">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#db2777] shadow-sm">
                  <Sparkles size={13} />
                  Baby Bloom
                </span>

                <h1 className="mt-4 max-w-lg text-[2.1rem] font-black leading-[0.96] tracking-[-0.065em] text-[#3b1020] md:text-[3.25rem]">
                  A soft, cute store page for baby brands.
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-[#3b1020]/66">
                  Sweet, playful, and easy to shop. Products appear quickly so parents can browse and ask on WhatsApp.
                </p>
              </div>

              <div className="relative z-10 mt-5 flex flex-wrap gap-2">
                <a
                  href="#products"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#3b1020] px-4 py-2.5 text-xs font-black text-white transition hover:-translate-y-0.5"
                >
                  View Products
                  <ArrowRight size={14} />
                </a>

                <a
                  href="https://wa.me/"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-4 py-2.5 text-xs font-black text-[#db2777] shadow-sm transition hover:-translate-y-0.5"
                >
                  <MessageCircle size={14} />
                  Ask Now
                </a>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative min-h-[170px] overflow-hidden rounded-[1.35rem] border border-[#ffd6e8] bg-[#ffe4f1] md:min-h-[190px]">
                <Image
                  src="/main-hero.png"
                  alt="Market Villa baby bloom placeholder hero"
                  fill
                  sizes="(min-width: 768px) 55vw, 100vw"
                  className="object-cover opacity-80"
                  priority
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(59,16,32,0.36),rgba(236,72,153,0.08))]" />

                <div className="absolute bottom-3 left-3 right-3 rounded-[1.1rem] border border-white/60 bg-white/88 p-3 shadow-[0_16px_40px_rgba(236,72,153,0.16)] backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#db2777]">
                    Hero placeholder
                  </p>
                  <p className="mt-1 text-sm font-black text-[#3b1020]">
                    Replace this with baby products, kids fashion, toys, or gift boxes.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="baby-bloom-pop rounded-[1.15rem] border border-[#ffd6e8] bg-white p-3 shadow-sm">
                  <Heart size={18} className="text-[#ec4899]" />
                  <p className="mt-2 text-xs font-black text-[#3b1020]">
                    Soft picks
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#3b1020]/55">
                    Cute items parents love.
                  </p>
                </div>

                <div className="baby-bloom-pop rounded-[1.15rem] border border-[#ddd6fe] bg-[#faf5ff] p-3 shadow-sm">
                  <Star size={18} className="text-[#8b5cf6]" />
                  <p className="mt-2 text-xs font-black text-[#3b1020]">
                    Gift ready
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#3b1020]/55">
                    Great for hampers.
                  </p>
                </div>

                <div className="baby-bloom-pop rounded-[1.15rem] border border-[#fed7aa] bg-[#fff7ed] p-3 shadow-sm">
                  <ShoppingBag size={18} className="text-[#f97316]" />
                  <p className="mt-2 text-xs font-black text-[#3b1020]">
                    Easy order
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[#3b1020]/55">
                    WhatsApp-ready.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="products" className="border-t border-[#ffd6e8] px-4 py-4 md:px-5">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#db2777]">
                  Baby Products
                </p>
                <h2 className="mt-1 text-2xl font-black tracking-[-0.05em] text-[#3b1020]">
                  Cute items visible at first glance.
                </h2>
              </div>

              <a
                href="#contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#ffe4f1] px-4 py-2 text-xs font-black text-[#db2777]"
              >
                Contact
                <ArrowRight size={14} />
              </a>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {products.map((product) => (
                <article
                  key={product.name}
                  className="baby-bloom-product rounded-[1.25rem] border border-[#ffd6e8] bg-white p-3 shadow-[0_16px_48px_rgba(236,72,153,0.1)] transition hover:-translate-y-1 hover:shadow-[0_20px_55px_rgba(236,72,153,0.16)]"
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[#ffe4f1] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#db2777]">
                      {product.tag}
                    </span>

                    <Baby size={17} className="text-[#ec4899]" />
                  </div>

                  <div className="grid min-h-20 place-items-center rounded-[1.1rem] bg-[linear-gradient(135deg,#ffe4f1,#faf5ff)]">
                    <ShoppingBag size={25} className="text-[#3b1020]" />
                  </div>

                  <h3 className="mt-3 text-sm font-black tracking-[-0.03em] text-[#3b1020]">
                    {product.name}
                  </h3>

                  <p className="mt-1 text-base font-black text-[#db2777]">
                    {product.price}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-[#3b1020]/62">
                    {product.description}
                  </p>

                  <a
                    href="https://wa.me/"
                    className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#ec4899] px-3 py-2 text-xs font-black text-white transition hover:bg-[#db2777]"
                  >
                    <MessageCircle size={14} />
                    Ask
                  </a>
                </article>
              ))}
            </div>
          </section>

          <section id="about" className="border-t border-[#ffd6e8] px-4 py-4 md:px-5">
            <div className="rounded-[1.2rem] bg-[#fff1f8] p-4">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#db2777]">
                About this baby store
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#3b1020]/66">
                Add a short brand story, delivery note, sizing details, care instructions, or opening hours here.
              </p>
            </div>
          </section>
        </div>
      </section>

      <footer id="contact" className="px-4 pb-5 md:px-6">
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.2rem] border border-[#ffd6e8] bg-[#3b1020] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-white">Baby Store Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-pink-50/68">
              Footer area for business contact, delivery details, location, and customer support information.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-pink-50/76">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-pink-200" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-pink-200" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}