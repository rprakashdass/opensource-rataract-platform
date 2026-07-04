import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { getConfig } from "@/lib/config";
import LayoutProvider from "@/components/providers/LayoutProvider";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopLoader from "@/components/loaders/TopLoader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const config = getConfig();

export const metadata: Metadata = {
  title: {
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
  description: "A modern platform for Rotaract clubs and districts",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(config.appUrl),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content, viewport-fit=cover"
        />
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-gray-950`}>
        <Suspense>
          <TopLoader />
          <LayoutProvider>{children}</LayoutProvider>
          <Toaster position="top-right" />
        </Suspense>
      </body>
    </html>
  );
}
