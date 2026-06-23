"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const promises = [
  "trusted fashion brand",
  "food vendor customers remember",
  "beauty plug with a clean page",
  "local store that looks premium",
  "local business customers can trust",
];

export function RotatingHeroPromise() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % promises.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <span className="block">
      Be the next{" "}
      <span className="relative inline-grid min-h-[1.08em] min-w-[10ch] align-bottom text-[#7c3aed]">
        <AnimatePresence mode="wait">
          <motion.span
            key={promises[activeIndex]}
            initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -14, filter: "blur(8px)" }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="col-start-1 row-start-1"
          >
            {promises[activeIndex]}.
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  );
}
