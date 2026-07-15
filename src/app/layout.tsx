import type { Metadata } from "next";
import { Inter, Fraunces, Figtree } from "next/font/google";
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

// THADAM V2 public-site faces: Fraunces for statements, Figtree for everything else
const fraunces = Fraunces({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT"],
});

const figtree = Figtree({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-figtree",
});

const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export async function generateMetadata(): Promise<Metadata> {
  const layoutData = await getPublicLayoutData();
  const settings = layoutData?.settings as any;

  const title = settings?.seoTitle || appName;
  const description = settings?.seoDescription || "A modern platform for Rotaract clubs and districts";

  return {
    title: {
      default: title,
      template: `%s | ${title}`,
    },
    description,
    icons: {
      icon: "/favicon.ico",
    },
    metadataBase: new URL(appUrl),
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const layoutData = await getPublicLayoutData();
  const settings = layoutData?.settings;

  // Retrieve brand styling or fallbacks
  const primaryColor = settings?.primaryColor || "#F7A800";
  const secondaryColor = settings?.secondaryColor || "#003DA5";
  const accentColor = settings?.accentColor || "#FAF9F6";
  const darkColor = settings?.darkColor || "#0B132B";
  const lightColor = settings?.lightColor || "#FAF9F6";

  return (
    <html lang="en" className={`h-full antialiased ${fraunces.variable} ${figtree.variable}`}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, interactive-widget=resizes-content, viewport-fit=cover"
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-primary: ${primaryColor};
                --color-secondary: ${secondaryColor};
                --color-accent: ${accentColor};
                --color-foreground: ${darkColor};
                --color-background: ${lightColor};
                --color-border: rgba(0, 0, 0, 0.08);
              }
            `,
          }}
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
