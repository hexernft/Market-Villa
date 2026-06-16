"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const SupportWidget = dynamic(
  () => import("@/components/SupportWidget").then((module) => module.SupportWidget),
  {
    ssr: false,
    loading: () => null,
  },
);

export function DeferredSupportWidget() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const loadWidget = () => setShouldLoad(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadWidget, { timeout: 2500 });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(loadWidget, 1400);

    return () => globalThis.clearTimeout(timeoutId);
  }, []);

  return shouldLoad ? <SupportWidget /> : null;
}
