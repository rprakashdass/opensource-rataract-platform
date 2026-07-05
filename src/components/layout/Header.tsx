"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MenuIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Team", href: "/team" },
  { label: "Events", href: "/events" },
  { label: "Sponsor Us", href: "/sponsor-us" },
  { label: "Member Portal", href: "/dashboard" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
  const orgSubName = process.env.NEXT_PUBLIC_ORG_SUB_NAME || "District & Club Platform";

  return (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 sm:px-4 pointer-events-none">
      <div className="w-full max-w-5xl glass-pill px-4 sm:px-6 py-2.5 flex items-center justify-between pointer-events-auto border border-primary/10 gap-2">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 sm:space-x-3 select-none min-w-0 flex-shrink-0">
          <Image
            src="/favicon.ico"
            alt="Rotaract Club Logo"
            width={36}
            height={36}
            className="hover:scale-105 transition-transform flex-shrink-0 sm:w-[44px] sm:h-[44px]"
          />
          <div className="flex flex-col -space-y-0.5 min-w-0">
            <span className="text-sm sm:text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent truncate max-w-[140px] sm:max-w-none">
              {appName}
            </span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground uppercase tracking-widest font-semibold hidden xs:block">
              {orgSubName}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-0.5 bg-primary/5 p-1 rounded-full border border-primary/10 flex-shrink-0">
          {NAV_LINKS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} prefetch href={item.href}>
                <button
                  className={cn(
                    "text-xs font-semibold px-3 lg:px-4 py-2 rounded-full transition-all duration-300 cursor-pointer select-none whitespace-nowrap",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm scale-105"
                      : "text-muted-foreground hover:text-foreground hover:bg-primary/10"
                  )}
                >
                  {item.label}
                </button>
              </Link>
            );
          })}
        </nav>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden cursor-pointer flex-shrink-0 h-9 w-9">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-l border-zinc-200/40 dark:border-zinc-800/40 glass-panel">
            {/* Logo in sheet */}
            <div className="flex items-center gap-3 mb-8 mt-2">
              <Image src="/favicon.ico" alt="Logo" width={36} height={36} />
              <div>
                <p className="font-bold text-sm text-foreground">{appName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{orgSubName}</p>
              </div>
            </div>
            <div className="flex flex-col space-y-1">
              {NAV_LINKS.map((item, index) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={index}
                    prefetch
                    href={item.href}
                    className={cn(
                      "text-base font-semibold px-4 py-3 rounded-lg transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-muted-foreground hover:text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900"
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
