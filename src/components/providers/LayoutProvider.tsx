"use client";

import { usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { FootprintTrail } from "@/components/ui/public/v2/FootprintTrail";

export default function LayoutProvider({
  children,
  layoutData,
}: {
  children: React.ReactNode;
  layoutData?: any;
}) {
  const pathname = usePathname();
  const noLayoutPages = ["/join-now", "/sustainability-hackathon"];

  useEffect(() => {
    const isNoLayout = noLayoutPages.includes(pathname) || 
                       pathname.startsWith("/admin") || 
                       pathname.startsWith("/auth") || 
                       pathname.startsWith("/dashboard");
    if (isNoLayout) return;

    // Check prefers-reduced-motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mediaQuery.matches) return;

    let lenisInstance: any = null;
    let rafId: number;

    import("lenis").then(({ default: Lenis }) => {
      lenisInstance = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
      });

      function raf(time: number) {
        lenisInstance.raf(time);
        rafId = requestAnimationFrame(raf);
      }

      rafId = requestAnimationFrame(raf);
    });

    return () => {
      if (lenisInstance) {
        lenisInstance.destroy();
      }
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [pathname]);

  if (noLayoutPages.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/dashboard")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col relative font-body bg-paper text-ink">
      <FootprintTrail />
      <Header layoutData={layoutData} />
      <div className="flex-1">{children}</div>
      <Footer layoutData={layoutData} />
    </div>
  );
}
