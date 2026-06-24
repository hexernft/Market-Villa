import Image from "next/image";
import {
  Clock3,
  Heart,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  ShoppingBag,
  Sparkles,
  Store
} from "lucide-react";

const products = [
  {
  name: "Handpicked Item",
    price: "₦9,500",
    tag: "Fresh pick",
    description: "A warm product card for everyday items, handmade goods, or fresh offers."
},
  {
  name: "Signature Bundle",
    price: "₦16,000",
    tag: "Best seller",
    description: "Use this for bundles, customer favourites, or your strongest offer."
},
  {
  name: "Special Order",
    price: "₦22,000",
    tag: "Premium",
    description: "Perfect for custom orders, premium packages, or limited stock products."
},
];

export function MarketVillaWarmBoutiqueTheme() {
  return (
    <main className="warm-boutique-theme min-h-screen bg-[#fff7ed] text-[#32190d]">
      <section className="px-4 py-4 md:px-6">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.4rem] border border-[#fed7aa] bg-[#fffaf3] shadow-[0_20px_70px_rgba(154,52,18,0.12)]">
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#fed7aa] px-4 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#9a3412] text-white shadow-[0_12px_28px_rgba(154,52,18,0.22)]">
                <Store size={18} />
              </div>

              <div>
                <p className="text-sm font-black tracking-[-0.02em] text-[#32190d]">
                  Business Name
                </p>
                <p className="text-xs font-medium text-[#32190d]/55">
                  Warm boutique storefront
                </p>
              </div>
            </div>

            <a
              href="https://wa.me/"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#9a3412] px-4 py-2 text-xs font-black text-white shadow-[0_12px_30px_rgba(154,52,18,0.24)]"
            >
              <MessageCircle size={15} />
              Chat
            </a>
          </header>

          <section className="grid gap-4 p-4 md:grid-cols-[0.82fr_1.18fr] md:items-stretch md:p-5">
            <div className="flex min-h-[245px] flex-col justify-between rounded-[1.15rem] bg-[#431407] p-5 text-white md:min-h-[300px]">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-[#fed7aa]/15 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#fed7aa]">
                  <Sparkles size={13} />
                  Warm Boutique
                </span>

                <h1 className="mt-4 max-w-lg text-[2rem] font-black leading-[0.98] tracking-[-0.065em] text-white md:text-[3.2rem]">
                  A softer storefront for products that feel personal.
                </h1>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/76">
                  A compact, warm store style with products visible fast and a friendly path to WhatsApp orders.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <div className="rounded-2xl bg-white/10 p-3 text-white">
                  <Heart size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">
                    Loved
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3 text-white">
                  <Package size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">
                    Curated
                  </p>
                </div>

                <div className="rounded-2xl bg-white/10 p-3 text-white">
                  <Clock3 size={17} />
                  <p className="mt-2 text-[11px] font-bold text-white/85">
                    Quick
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              <div className="relative min-h-[165px] overflow-hidden rounded-[1.15rem] bg-[#fed7aa] md:min-h-[180px]">
                <Image
                  src="/main-hero.png"
                  alt="Market Villa warm boutique placeholder hero"
                  fill
                  sizes="(min-width: 768px) 56vw, 100vw"
                  className="object-cover"
                  priority
                />

                <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(67,20,7,0.48),rgba(251,146,60,0.08))]" />

                <div className="absolute bottom-3 left-3 right-3 rounded-2xl border border-white/50 bg-[#fffaf3]/92 p-3 shadow-[0_16px_40px_rgba(67,20,7,0.16)] backdrop-blur">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#9a3412]">
                    Placeholder hero item
                  </p>
                  <p className="mt-1 text-sm font-black text-[#32190d]">
                    Replace this area with a featured product, offer, or brand photo.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {products.map((product) => (
                  <article
                    key={product.name}
                    className="rounded-[1.08rem] border border-[#fed7aa] bg-white p-3 shadow-[0_14px_42px_rgba(154,52,18,0.08)]"
                  >
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <span className="rounded-full bg-[#fff7ed] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#9a3412] ring-1 ring-[#fed7aa]">
                        {product.tag}
                      </span>

                      <ShoppingBag size={17} className="text-[#9a3412]" />
                    </div>

                    <h3 className="text-sm font-black tracking-[-0.03em] text-[#32190d]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-base font-black text-[#9a3412]">
                      {product.price}
                    </p>

                    <p className="mt-2 text-xs leading-5 text-[#32190d]/62">
                      {product.description}
                    </p>

                    <a
                      href="https://wa.me/"
                      className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#9a3412] px-3 py-2 text-xs font-black text-white"
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
        <div className="mx-auto grid max-w-6xl gap-3 rounded-[1.15rem] border border-[#fed7aa] bg-[#fffaf3] p-4 shadow-sm md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-black text-[#32190d]">Business Name</p>
            <p className="mt-1 max-w-xl text-sm leading-6 text-[#32190d]/62">
              Footer space for delivery notes, opening hours, business story, and customer contact details.
            </p>
          </div>

          <div className="grid gap-2 text-sm font-semibold text-[#32190d]/70">
            <p className="inline-flex items-center gap-2">
              <MapPin size={15} className="text-[#9a3412]" />
              Abuja, Nigeria
            </p>

            <p className="inline-flex items-center gap-2">
              <Phone size={15} className="text-[#9a3412]" />
              +234 000 000 0000
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}