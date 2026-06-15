"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
    }, 3800);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="hidden w-[390px] justify-self-end lg:block"
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative overflow-hidden rounded-[2rem] border border-white/60 bg-white/42 p-2.5 shadow-[0_24px_70px_rgba(55,31,83,0.15)] backdrop-blur-2xl"
      >
        <motion.div
          animate={{ opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -right-4 -top-4 h-24 w-24 bg-[#c4b5fd]/35 blur-2xl"
        />

        <motion.div
          animate={{ opacity: [0.25, 0.5, 0.25], scale: [1, 1.06, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-4 -left-4 h-24 w-24 bg-[#26143d]/10 blur-2xl"
        />

        <div className="relative overflow-hidden rounded-[1.55rem] border border-white/70 bg-white/55 p-1.5">
          <div className="flex items-center gap-2 border-b border-[#7c3aed]/10 bg-white/50 px-3 py-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#7c3aed]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#eadcff]" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            <span className="ml-3 h-2 w-32 rounded-full bg-slate-100" />
          </div>

          <div className="relative h-[350px] w-full overflow-hidden bg-white/55">
            <AnimatePresence mode="wait">
              <motion.div
                key={heroImages[activeIndex]}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 overflow-hidden"
              >
                <img
                  src={heroImages[activeIndex]}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full scale-110 object-cover blur-xl"
                />

                <div className="absolute inset-0 bg-[#ffe4d6]/60" />

                <div className="absolute inset-0 grid place-items-center overflow-hidden">
                  <motion.img
                    src={heroImages[activeIndex]}
                    alt={`Market Villa preview ${activeIndex + 1}`}
                    initial={{ y: 10, scale: 0.98 }}
                    animate={{ y: 0, scale: 1 }}
                    transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
                    className="block max-h-full max-w-full object-contain"
                  />
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-black/5" />

            <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2">
              {heroImages.map((image, index) => (
                <button
                  key={image}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeIndex === index
                      ? "w-7 bg-[#7c3aed]"
                      : "w-2 bg-white/80"
                  }`}
                  aria-label={`Show hero image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}