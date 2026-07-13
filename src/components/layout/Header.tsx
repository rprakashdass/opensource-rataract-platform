"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon, Heart } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Initiatives", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "Team", href: "/team" },
  { label: "Sponsor Us", href: "/partner" },
];

export default function Header({ layoutData }: { layoutData?: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const club = layoutData?.club;
  const settings = layoutData?.settings;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
  const logoUrl = club?.logoUrl;

  const navLinks = layoutData?.navigationItems && layoutData.navigationItems.length > 0
    ? layoutData.navigationItems.map((item: any) => ({ label: item.label, href: item.url }))
    : NAV_LINKS.filter(link => {
        // Filter out if pages are disabled in CMS
        if (link.href === "/partner" && settings?.enablePartner === false) return false;
        if (link.href === "/join" && settings?.enableJoin === false) return false;
        if (link.href === "/our-archive" && settings?.enableArchive === false) return false;
        return true;
      });

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "top-4 mx-4 md:mx-12 lg:mx-auto max-w-[1400px] bg-white/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-white/50 rounded-3xl py-2"
          : "top-0 mx-0 bg-transparent py-6"
      )}
    >
      <div className={cn(
        "w-full mx-auto flex items-center justify-between",
        scrolled ? "px-6 sm:px-8" : "max-w-[1400px] px-6 sm:px-12"
      )}>
        {/* Logo Replacement: Elegant Typography */}
        <Link href="/" className="flex items-center select-none flex-shrink-0 group">
          <span className={cn(
            "text-xl md:text-2xl font-black tracking-tighter uppercase",
            !scrolled && pathname === "/partner" ? "text-white" : "text-[#0B132B]"
          )}>
            {appName.replace("Rotaract Club of ", "").replace("RAC ", "")}
            <span className="text-[#F7A800]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-8">
          {navLinks.map((item: any) => {
            const isActive = pathname === item.href;
            const isDarkHero = !scrolled && pathname === "/partner";
            return (
              <Link key={item.label} href={item.href} className="group relative py-2">
                <span
                  className={cn(
                    "text-sm font-bold transition-all duration-300",
                    isActive
                      ? (isDarkHero ? "text-white" : "text-[#0B132B]")
                      : (isDarkHero ? "text-slate-300 group-hover:text-white" : "text-slate-500 group-hover:text-[#0B132B]")
                  )}
                >
                  {item.label}
                </span>
                {/* Numiko style hover underline */}
                <span className={cn(
                  "absolute bottom-0 left-0 h-0.5 bg-[#F7A800] transition-all duration-300",
                  isActive ? "w-full" : "w-0 group-hover:w-full"
                )} />
              </Link>
            );
          })}
        </nav>

        {/* CTA & Mobile */}
        <div className="flex items-center gap-6">
          <Link 
            href="/auth/login" 
            className={cn(
              "hidden md:block text-sm font-bold transition-colors relative group",
              !scrolled && pathname === "/partner" ? "text-slate-300 hover:text-white" : "text-slate-500 hover:text-[#0B132B]"
            )}
          >
            Member Portal
            <span className={cn(
              "absolute bottom-0 left-0 h-0.5 w-0 transition-all duration-300 group-hover:w-full",
              !scrolled && pathname === "/partner" ? "bg-white" : "bg-[#0B132B]"
            )} />
          </Link>
          <Link href="/join" className="hidden md:block">
            <Button className="font-bold rounded-full px-7 h-11 bg-[#F7A800] hover:bg-[#e09700] text-[#0B132B] shadow-md hover:shadow-lg transition-all hover:scale-[1.02]">
              Join Us
            </Button>
          </Link>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden h-10 w-10 rounded-full transition-colors",
                  !scrolled && pathname === "/partner"
                    ? "text-white hover:bg-white/10"
                    : "text-slate-900 hover:bg-slate-100"
                )}
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] border-l-0 bg-[#FAF9F6] p-0 flex flex-col">
              <div className="p-8 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3 mb-12 mt-2">
                  <span className="text-xl font-black tracking-tighter text-[#0B132B] uppercase">
                    {appName.replace("Rotaract Club of ", "").replace("RAC ", "")}
                    <span className="text-[#F7A800]">.</span>
                  </span>
                </div>
                <nav className="flex flex-col space-y-2">
                  {navLinks.map((item: any, index: number) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        className={cn(
                          "text-lg font-black transition-colors w-fit",
                          isActive
                            ? "text-[#F7A800]"
                            : "text-slate-600 hover:text-[#0B132B]"
                        )}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="pt-6 border-t border-slate-200/50 flex flex-col gap-4">
                <Link href="/join" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-[#F7A800] hover:bg-[#e09700] text-[#0B132B] font-bold rounded-xl h-12 shadow-md">
                    Join The Club
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full text-center text-sm font-bold text-slate-500 hover:text-[#0B132B] transition">
                  Member Portal Login
                </Link>
              </div>
            </SheetContent>
        </Sheet>
      </div>
      </div>
    </header>
  );
}