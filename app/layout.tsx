import type { Metadata } from "next";
import "./globals.css";
import { SupportWidget } from "@/components/SupportWidget";
import { AppMotionProvider } from "@/components/AppMotionProvider";

export const metadata: Metadata = {
  title: "Market Villa",
  description: "Mini business websites with WhatsApp checkout."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body><AppMotionProvider>{children}</AppMotionProvider><SupportWidget /></body>
    </html>
  );
}




