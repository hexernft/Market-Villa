"use client";

import { useEffect, useState } from "react";

const heroImages = [
  "/hero-main.png",
  "/hero1.png",
  "/hero2.png",
  "/hero3.png",
];

export function HeroImageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % heroImages.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="hidden lg:block">
      <div className="relative border border-orange-200 bg-white p-3 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
        <div className="absolute -right-4 -top-4 h-24 w-24 bg-[#ff6a00]/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-slate-950/5 blur-2xl" />

        <div className="relative border border-slate-200 bg-slate-50 p-2">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00]" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="ml-3 h-2 w-32 rounded-full bg-slate-100" />
          </div>

          <div className="relative min-h-[500px] overflow-hidden bg-orange-50">
            {heroImages.map((image, index) => (
              <img
                key={image}
                src={image}
                alt={`Market Villa preview ${index + 1}`}
                className={`absolute inset-0 h-full w-full object-cover transition-all duration-700 ease-out ${
                  activeIndex === index
                    ? "scale-100 opacity-100"
                    : "scale-[1.03] opacity-0"
                }`}
              />
            ))}

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />
          </div>

          <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {heroImages.map((image, index) => (
              <button
                key={image}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  activeIndex === index
                    ? "w-7 bg-[#ff6a00]"
                    : "w-2 bg-slate-300"
                }`}
                aria-label={`Show hero image ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}