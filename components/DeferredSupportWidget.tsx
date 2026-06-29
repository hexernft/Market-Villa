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

  const rootRoutesWithSupport = new Set([
    "",
    "admin-login",
    "dashboard",
    "help",
    "login",
    "privacy",
    "reset-password",
    "signup",
    "signup-success",
    "status",
    "stores",
    "terms",
  ]);
  const segments = pathname?.split("/").filter(Boolean) || [];
  const isRootStoreAlias =
    segments.length === 1 &&
    !rootRoutesWithSupport.has(segments[0]) &&
    !segments[0].startsWith("theme-preview");
  const isStorePage = pathname?.startsWith("/store/");
  const isAdminPage = pathname?.startsWith("/admin");

  const shouldHideSupportWidget = isStorePage || isRootStoreAlias || isAdminPage;

  useEffect(() => {
    if (shouldHideSupportWidget) {
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
  }, [shouldHideSupportWidget]);

  return shouldLoad && !shouldHideSupportWidget ? <SupportWidget /> : null;
}
