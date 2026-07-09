import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import LayoutProvider from "@/components/providers/LayoutProvider";
import { getPublicLayoutData } from "@/features/public/queries/getPublicLayoutData";
import { Providers } from "@/app/providers";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import TopLoader from "@/components/loaders/TopLoader";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: appName,
    template: `%s | ${appName}`,
  },
  description: "A modern platform for Rotaract clubs and districts",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL(appUrl),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutData = await getPublicLayoutData();
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
          <Providers>
            <LayoutProvider layoutData={layoutData}>{children}</LayoutProvider>
          </Providers>
          <Toaster position="top-right" />
        </Suspense>
      </body>
    </html>
  );
}
