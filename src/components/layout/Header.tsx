"use client";

import Link from "next/link";
import React from "react";
import { Button } from "../ui/button";
import { ClubLogo } from "@/components/ui/club-logo";
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
  { label: "Updates", href: "/announcements" },
];

export default function Header({ layoutData }: { layoutData?: any }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const club = layoutData?.club;

  const appName = club?.shortName || club?.name || process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Club";
  const logoUrl = club?.logoUrl;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/50 shadow-sm text-slate-900 transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-3 select-none flex-shrink-0 group">
          <div className="bg-white rounded-full p-1 overflow-hidden shadow-sm border border-slate-100 group-hover:border-amber-400 transition-colors">
            <ClubLogo logoUrl={logoUrl} name={appName} size={40} />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-lg md:text-xl font-black tracking-tight leading-tight truncate text-slate-900">
              {appName}
            </span>
            <span className="text-[10px] text-amber-600 uppercase tracking-widest font-bold hidden xs:block">
              Rotary International
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href}>
                <span
                  className={cn(
                    "text-sm font-bold px-4 py-2 rounded-xl transition-all duration-300",
                    isActive
                      ? "text-amber-600 bg-amber-50"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* CTA & Mobile */}
        <div className="flex items-center gap-3">
          <Link href="/join" className="hidden md:block">
            <Button className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full px-6 shadow-md shadow-amber-500/20 transition-all">
              <Heart className="w-4 h-4 mr-2" /> Join Us
            </Button>
          </Link>
          <Link href="/auth/login" className="hidden md:block text-sm font-bold text-slate-500 hover:text-slate-900 ml-2 transition">
            Member Login
          </Link>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden h-10 w-10 text-slate-900 hover:bg-slate-100 rounded-full">
                <MenuIcon className="h-6 w-6" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] border-l border-slate-100 bg-white text-slate-900">
              <div className="flex items-center gap-3 mb-8 mt-4">
                <ClubLogo logoUrl={logoUrl} name={appName} size={40} className="bg-slate-50 p-1 border border-slate-100" />
                <div>
                  <p className="font-black text-lg text-slate-900">{appName}</p>
                  <p className="text-[10px] text-amber-600 uppercase tracking-widest font-bold">Rotary International</p>
                </div>
              </div>
              <div className="flex flex-col space-y-2">
                {NAV_LINKS.map((item, index) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={index}
                      href={item.href}
                      className={cn(
                        "text-base font-bold px-4 py-3 rounded-xl transition-colors",
                        isActive
                          ? "bg-amber-50 text-amber-600"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      )}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col gap-4">
                <Link href="/join" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 font-bold rounded-xl h-12 shadow-md shadow-amber-500/20">
                    <Heart className="w-4 h-4 mr-2" /> Join The Club
                  </Button>
                </Link>
                <Link href="/auth/login" onClick={() => setIsOpen(false)} className="w-full text-center text-sm font-bold text-slate-500 hover:text-slate-900 transition">
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