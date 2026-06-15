"use client";

import { ReactNode } from "react";
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
  const offset =
    direction === "left"
      ? { x: -36, y: 0 }
      : direction === "right"
        ? { x: 36, y: 0 }
        : { x: 0, y: 34 };

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


