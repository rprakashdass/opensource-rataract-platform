"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn, getGoogleDriveDirectLink } from "@/lib/utils";

const NAV_LINKS = [
  { label: "About", href: "/about" },
  { label: "Our Work", href: "/projects" },
  { label: "Events", href: "/events" },
  { label: "People", href: "/team" },
  { label: "Sponsor Us", href: "/partner" },
];

// Pages that open on a dark or full-bleed-photo hero: header text starts light.
const DARK_HERO_PATHS = ["/", "/partner", "/join"];

export default function Header({ layoutData }: { layoutData?: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const pathname = usePathname();
  const club = layoutData?.club;
  const settings = layoutData?.settings;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
  const wordmark = appName.replace("Rotaract Club of ", "").replace("RAC ", "");
  const logoUrl = club?.logoUrl ? getGoogleDriveDirectLink(club.logoUrl) : null;

  const navLinks =
    layoutData?.navigationItems && layoutData.navigationItems.length > 0
      ? layoutData.navigationItems.map((item: any) => ({ label: item.label, href: item.url }))
      : NAV_LINKS.filter((link) => {
          if (link.href === "/partner" && settings?.enablePartner === false) return false;
          if (link.href === "/join" && settings?.enableJoin === false) return false;
          if (link.href === "/our-archive" && settings?.enableArchive === false) return false;
          return true;
        });

  React.useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 24);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const onDarkHero = !scrolled && DARK_HERO_PATHS.includes(pathname);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-paper/85 backdrop-blur-md border-b border-hairline py-3"
          : onDarkHero
            ? "bg-gradient-to-b from-ink/75 via-ink/35 to-transparent py-5 pb-12"
            : "bg-transparent py-5"
      )}
    >
      <div className="max-w-[1280px] mx-auto flex items-center justify-between px-6 lg:px-10">
        {/* Wordmark / logo */}
        <Link href="/" className="flex items-center gap-3 select-none shrink-0 group">
          {logoUrl && (
            <span className="relative w-9 h-9 rounded-full overflow-hidden bg-white/90">
              <Image src={logoUrl} alt={`${appName} logo`} fill sizes="36px" className="object-contain p-0.5" />
            </span>
          )}
          <span
            className={cn(
              "font-display font-semibold text-xl md:text-[22px] tracking-[-0.01em] transition-colors",
              onDarkHero ? "text-parchment" : "text-ink"
            )}
          >
            {wordmark}
            <span className="text-brand">.</span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center gap-8">
          {navLinks.map((item: any) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "thadam-link text-[15px] font-medium transition-colors",
                  isActive
                    ? onDarkHero
                      ? "text-parchment"
                      : "text-ink"
                    : onDarkHero
                      ? "text-parchment/70 hover:text-parchment"
                      : "text-ink-soft hover:text-ink"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Portal link, Join pill, mobile menu */}
        <div className="flex items-center gap-6">
          <Link
            href="/auth/login"
            className={cn(
              "hidden md:block thadam-link text-[15px] font-medium transition-colors",
              onDarkHero ? "text-parchment/70 hover:text-parchment" : "text-ink-soft hover:text-ink"
            )}
          >
            Member Portal
          </Link>
          {settings?.enableJoin !== false && (
            <Link
              href="/join"
              className="hidden md:inline-flex motion-button items-center rounded-full bg-brand px-7 py-2.5 text-[15px] font-semibold text-white hover:bg-brand-deep transition-colors"
            >
              Join us
            </Link>
          )}

          {/* Mobile navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "lg:hidden h-10 w-10 rounded-full transition-colors",
                  onDarkHero
                    ? "text-parchment hover:bg-white/10"
                    : "text-ink hover:bg-wash"
                )}
              >
                <MenuIcon className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] border-l-0 bg-paper p-0 flex flex-col">
              <div className="p-8 flex-1">
                <span className="font-display font-semibold text-xl text-ink tracking-[-0.01em]">
                  {wordmark}
                  <span className="text-brand">.</span>
                </span>
                <nav className="flex flex-col gap-1 mt-12">
                  {navLinks.map((item: any, index: number) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={index}
                        href={item.href}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "font-display font-medium text-3xl py-2 w-fit transition-colors",
                          isActive ? "text-brand-deep" : "text-ink hover:text-brand-deep"
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="p-8 pt-6 border-t border-hairline flex flex-col gap-5">
                {settings?.enableJoin !== false && (
                  <Link
                    href="/join"
                    onClick={() => setIsOpen(false)}
                    className="motion-button inline-flex items-center justify-center rounded-full bg-brand px-8 py-3.5 text-[15px] font-semibold text-white hover:bg-brand-deep transition-colors"
                  >
                    Join us
                  </Link>
                )}
                <Link
                  href="/auth/login"
                  onClick={() => setIsOpen(false)}
                  className="text-center text-sm font-medium text-ink-soft hover:text-ink transition-colors"
                >
                  Member Portal
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
