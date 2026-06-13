import type { Metadata } from "next";
import "./globals.css";
import { SupportWidget } from "@/components/SupportWidget";

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
      <body>{children}<SupportWidget /></body>
    </html>
  );
}


