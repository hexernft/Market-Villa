"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShoppingBag,
  Store,
} from "lucide-react";
import { WhatsAppCheckout, type CartItem } from "@/components/WhatsAppCheckout";
import { buildWhatsAppLink, formatCurrency } from "@/lib/utils";

type StoreProduct = {
  id: string;
  name: string;
  price?: number | string | null;
  category?: string | null;
  image_url?: string | null;
  image?: string | null;
  is_available?: boolean | null;
  is_published?: boolean | null;
};

type StoreBusiness = {
  id: string;
  name: string;
  slug?: string | null;
  tagline?: string | null;
  description?: string | null;
  logo_url?: string | null;
  logo_text?: string | null;
  cover_image_url?: string | null;
  banner_url?: string | null;
  hero_image_url?: string | null;
  whatsapp?: string | null;
  phone?: string | null;
  email?: string | null;
  location?: string | null;
  products?: StoreProduct[] | null;
};

type Props = {
  business: StoreBusiness;
  products?: StoreProduct[] | null;
  services?: StoreProduct[] | null;
};

const fallbackImage =
  "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=1600&auto=format&fit=crop";

function getHeroImage(business: StoreBusiness) {
  return (
    business.cover_image_url ||
    business.banner_url ||
    business.hero_image_url ||
    fallbackImage
  );
}

function isVisibleItem(item: StoreProduct) {
  return item.is_available !== false && item.is_published !== false;
}

export function DefaultOnePageTheme({
  business,
  products,
  services,
}: Props) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const items = useMemo(() => {
    return [...(products || business.products || []), ...(services || [])].filter(
      isVisibleItem,
    );
  }, [business.products, products, services]);

  const whatsapp = business.whatsapp || business.phone || "";
  const heroImage = getHeroImage(business);

  function addToCart(item: StoreProduct) {
    const price = Number(item.price || 0);

    setCart((current) => {
      const existing = current.find((cartItem) => cartItem.id === item.id);

      if (existing) {
        return current.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        );
      }

      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price,
          quantity: 1,
          image: item.image_url || item.image || "",
        },
      ];
    });
  }

  return (
    <main className="market-villa-customized-store min-h-screen bg-[#fbf9ff] text-[#211331]">
      <header className="sticky top-0 z-40 border-b border-[#eee7f7] bg-[#fbf9ff]/94 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href={`/store/${business.slug || ""}`} className="flex min-w-0 items-center gap-3">
            {business.logo_url ? (
              <Image
                src={business.logo_url}
                alt={business.name}
                width={44}
                height={44}
                className="h-11 w-11 rounded-2xl object-cover"
              />
            ) : (
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#f1eaff] text-[#7c3aed]">
                <Store size={21} />
              </span>
            )}
            <span className="truncate text-base font-black tracking-[-0.03em]">
              {business.name}
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-sm font-bold text-[#6f6785] md:flex">
            <a href="#products">Products</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>

          {whatsapp ? (
            <a
              href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-4 text-sm font-black text-white"
            >
              <MessageCircle size={16} />
              WhatsApp
            </a>
          ) : null}
        </div>
      </header>

      <section className="px-4 py-5 md:py-8">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-[0.95fr_1.05fr] md:items-stretch">
          <div className="flex min-h-[280px] flex-col justify-end rounded-[1.5rem] border border-[#eee7f7] bg-white p-5 md:min-h-[420px] md:p-8">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#7c3aed]">
              Storefront
            </p>
            <h1 className="mt-3 max-w-2xl text-[2.45rem] font-black leading-[0.95] tracking-[-0.065em] md:text-[4.5rem]">
              {business.name}
            </h1>
            {business.tagline ? (
              <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#6f6785]">
                {business.tagline}
              </p>
            ) : null}
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-[1.5rem] border border-[#eee7f7] bg-[#eee7f7] md:min-h-[420px]">
            <Image
              src={heroImage}
              alt={business.name}
              fill
              priority
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section id="products" className="px-4 py-5">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-2xl font-black tracking-[-0.05em]">Products</h2>
            <p className="text-sm font-bold text-[#6f6785]">{items.length}</p>
          </div>

          {items.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-[1.25rem] border border-[#eee7f7] bg-white"
                >
                  <div className="relative min-h-52 bg-[#f1eaff]">
                    {item.image_url || item.image ? (
                      <Image
                        src={item.image_url || item.image || ""}
                        alt={item.name}
                        fill
                        sizes="(min-width: 1024px) 33vw, 100vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="grid h-52 place-items-center text-[#7c3aed]">
                        <ShoppingBag size={30} />
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    {item.category ? (
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#7c3aed]">
                        {item.category}
                      </p>
                    ) : null}
                    <h3 className="mt-2 text-lg font-black tracking-[-0.035em]">
                      {item.name}
                    </h3>
                    <p className="mt-3 text-xl font-black">
                      {formatCurrency(Number(item.price || 0))}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-[#7c3aed] px-4 text-sm font-black text-white"
                    >
                      <ShoppingBag size={16} />
                      Add to cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.25rem] border border-[#eee7f7] bg-white p-8 text-center">
              <h3 className="text-lg font-black tracking-[-0.035em]">
                Products
              </h3>
            </div>
          )}
        </div>
      </section>

      <section id="about" className="px-4 py-5">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-[1.25rem] border border-[#eee7f7] bg-white p-5 md:grid-cols-[0.6fr_1fr] md:p-7">
          <h2 className="text-2xl font-black tracking-[-0.05em]">About</h2>
          {business.description ? (
            <p className="text-sm font-semibold leading-7 text-[#6f6785]">
              {business.description}
            </p>
          ) : null}
        </div>
      </section>

      <section id="contact" className="px-4 py-5">
        <div className="mx-auto grid max-w-6xl gap-4 rounded-[1.25rem] bg-[#241436] p-5 text-white md:grid-cols-[0.7fr_1fr] md:p-7">
          <h2 className="text-2xl font-black tracking-[-0.05em]">Contact</h2>
          <div className="grid gap-3 text-sm font-bold">
            {whatsapp ? (
              <a
                href={buildWhatsAppLink(whatsapp, `Hello ${business.name}`)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#241436]"
              >
                <MessageCircle size={17} />
                WhatsApp
              </a>
            ) : null}
            {business.phone ? (
              <a href={`tel:${business.phone}`} className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <Phone size={17} />
                {business.phone}
              </a>
            ) : null}
            {business.email ? (
              <a href={`mailto:${business.email}`} className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <Mail size={17} />
                {business.email}
              </a>
            ) : null}
            {business.location ? (
              <span className="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
                <MapPin size={17} />
                {business.location}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <footer className="px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 border-t border-[#eee7f7] pt-5 text-sm font-bold text-[#6f6785]">
          <p>{business.name}</p>
          <p>Powered by Market Villa</p>
        </div>
      </footer>

      <WhatsAppCheckout
        businessId={business.id}
        businessName={business.name}
        whatsapp={whatsapp}
        cart={cart}
        setCart={setCart}
      />
    </main>
  );
}
