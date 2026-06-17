"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const SupportWidget = dynamic(
  () => import("@/components/SupportWidget").then((module) => module.SupportWidget),
  {
    ssr: false,
    loading: () => null,
  },
);

export function DeferredSupportWidget() {
  const pathname = usePathname();
  const [shouldLoad, setShouldLoad] = useState(false);

  const isAppWorkspace =
    pathname?.startsWith("/dashboard") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/admin-login");

  useEffect(() => {
    if (isAppWorkspace) {
      setShouldLoad(false);
      return;
    }

    const loadWidget = () => setShouldLoad(true);

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadWidget, { timeout: 2500 });

      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(loadWidget, 1400);

    return () => globalThis.clearTimeout(timeoutId);
  }, [isAppWorkspace]);

  return shouldLoad && !isAppWorkspace ? <SupportWidget /> : null;
}
