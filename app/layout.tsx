import type { Metadata } from "next";
import {
  Inter_Tight,
  Manrope,
  Oswald,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";
import { AppMotionProvider } from "@/components/AppMotionProvider";
import { DeferredSupportWidget } from "@/components/DeferredSupportWidget";

const marketFont = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-market",
  display: "swap",
});

const storeBodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-store-body",
  display: "swap",
});

const storeElegantFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-store-elegant",
  display: "swap",
});

const storeGrillFont = Oswald({
  subsets: ["latin"],
  variable: "--font-store-grill",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Market Villa",
  description: "Mini business websites with WhatsApp checkout.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${marketFont.variable} ${storeBodyFont.variable} ${storeElegantFont.variable} ${storeGrillFont.variable}`}
    >
      <body>
        <AppMotionProvider>{children}</AppMotionProvider>
        <DeferredSupportWidget />
      </body>
    </html>
  );
}
