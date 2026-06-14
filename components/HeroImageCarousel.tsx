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
    <div className="hidden w-[350px] justify-self-end lg:block">
      <div className="relative overflow-hidden border border-orange-200 bg-white p-2.5 shadow-[0_18px_50px_rgba(15,23,42,0.12)]">
        <div className="absolute -right-4 -top-4 h-24 w-24 bg-[#ff6a00]/10 blur-2xl" />
        <div className="absolute -bottom-4 -left-4 h-24 w-24 bg-slate-950/5 blur-2xl" />

        <div className="relative overflow-hidden border border-slate-200 bg-slate-50 p-1.5">
          <div className="flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6a00]" />
            <span className="h-2.5 w-2.5 rounded-full bg-orange-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="ml-3 h-2 w-32 rounded-full bg-slate-100" />
          </div>

          <div className="relative h-[350px] w-full overflow-hidden bg-white">
            {heroImages.map((image, index) => (
              <div
                key={image}
                className={`absolute inset-0 overflow-hidden transition-opacity duration-700 ease-out ${
                  activeIndex === index ? "opacity-100" : "opacity-0"
                }`}
              >
                <img
                  src={image}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                />

                <div className="absolute inset-0 bg-black/10" />

                <div className="absolute inset-0 grid place-items-center overflow-hidden">
                  <img
                    src={image}
                    alt={`Market Villa preview ${index + 1}`}
                    className={`block max-h-full max-w-full object-contain transition-transform duration-700 ease-out ${
                      activeIndex === index ? "scale-100" : "scale-[1.02]"
                    }`}
                  />
                </div>
              </div>
            ))}

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all ${
                    activeIndex === index
                      ? "w-7 bg-[#ff6a00]"
                      : "w-2 bg-white/80"
                  }`}
                  aria-label={`Show hero image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}