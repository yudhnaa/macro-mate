import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import ProgressBar from "./components/common/ProgressBar";
import { Suspense } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Macro Mate - Put your diet on autopilot",
  description:
    "Personalized meal plans based on your food preferences, budget, and schedule. Track macros and reach your nutrition goals.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <ProgressBar />
        </Suspense>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
