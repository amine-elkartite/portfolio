import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Amine ELKARTITE | Cybersecurity Engineer",
  description:
    "High-end portfolio for Amine ELKARTITE, Cybersecurity Engineer and Founder of SECUTrick.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.variable} bg-ink font-sans text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
