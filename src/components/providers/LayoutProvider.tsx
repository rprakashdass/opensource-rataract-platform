"use client";

import { usePathname } from "next/navigation";
import React from "react";
import Header from "../layout/Header";
import Footer from "../layout/Footer";
import ScrollToTop from "../layout/ScrollToTop";

export default function LayoutProvider({
  children,
  layoutData,
}: {
  children: React.ReactNode;
  layoutData?: any;
}) {
  const pathname = usePathname();
  const noLayoutPages = ["/join-now", "/sustainability-hackathon"];
  if (noLayoutPages.includes(pathname) || pathname.startsWith("/admin") || pathname.startsWith("/auth") || pathname.startsWith("/dashboard")) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col relative">
      {/* <ScrollToTop /> */}
      <Header layoutData={layoutData} />
      <div className="flex-1">{children}</div>
      <Footer layoutData={layoutData} />
    </div>
  );
}
