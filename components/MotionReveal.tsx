"use client";

import { ReactNode } from "react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type MotionRevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
};

export function MotionReveal({
  children,
  delay = 0,
  className = "",
  direction = "up",
}: MotionRevealProps) {
  const [useStaticReveal, setUseStaticReveal] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(max-width: 640px), (prefers-reduced-motion: reduce)",
    );

    function handleChange() {
      setUseStaticReveal(mediaQuery.matches);
    }

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const offset =
    direction === "left"
      ? { x: -36, y: 0 }
      : direction === "right"
        ? { x: 36, y: 0 }
      : { x: 0, y: 34 };

  if (useStaticReveal) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, ...offset }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.62, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}


