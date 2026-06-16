import type { Metadata } from "next";
import "./globals.css";
import { AppMotionProvider } from "@/components/AppMotionProvider";
import { DeferredSupportWidget } from "@/components/DeferredSupportWidget";

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
    <html lang="en">
      <body>
        <AppMotionProvider>{children}</AppMotionProvider>
        <DeferredSupportWidget />
      </body>
    </html>
  );
}
