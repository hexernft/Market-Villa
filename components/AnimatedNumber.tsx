"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

type AnimatedNumberProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  className?: string;
};

function formatNumber(value: number, compact = false) {
  return new Intl.NumberFormat("en-NG", {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: 0,
  }).format(value);
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  compact = false,
  className = "",
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 80, damping: 18 });
  const display = useTransform(
    spring,
    (latest) =>
      `${prefix}${formatNumber(Math.round(latest), compact)}${suffix}`,
  );
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    motionValue.set(value);
  }, [motionValue, value]);

  if (!hasMounted) {
    return (
      <span className={className}>
        {prefix}
        {formatNumber(value, compact)}
        {suffix}
      </span>
    );
  }

  return <motion.span className={className}>{display}</motion.span>;
}
