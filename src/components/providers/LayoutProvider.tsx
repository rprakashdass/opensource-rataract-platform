"use client";

import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import { FootprintTrail } from "@/components/ui/public/v2/FootprintTrail";
import { ReactLenis } from "lenis/react";

const noLayoutPages = ["/join-now", "/sustainability-hackathon"];

export default function LayoutProvider({
  children,
  layoutData,
}: {
  children: React.ReactNode;
  layoutData?: any;
}) {
  const pathname = usePathname();
  const [useLenis, setUseLenis] = useState(false);

  useEffect(() => {
    // Only enable Lenis if the user doesn't prefer reduced motion.
    // Done in useEffect to safely check window without SSR hydration mismatches.
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setUseLenis(!mediaQuery.matches);
    
    // Optional: listen for changes to reduced motion preference
    const listener = (e: MediaQueryListEvent) => setUseLenis(!e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  const isNoLayout =
    noLayoutPages.includes(pathname) ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/dashboard");

  if (isNoLayout) {
    return <>{children}</>;
  }

  const layout = (
    <div className="flex flex-col relative font-body bg-paper text-ink">
      <FootprintTrail />
      <Header layoutData={layoutData} />
      <div className="flex-1">{children}</div>
      <Footer layoutData={layoutData} />
    </div>
  );

  return useLenis ? (
    <ReactLenis
      root
      options={{
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        gestureOrientation: "vertical",
        smoothWheel: true,
        autoResize: true,
      }}
    >
      {layout}
    </ReactLenis>
  ) : (
    layout
  );
}
