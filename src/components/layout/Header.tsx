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
  { label: "Initiatives", href: "/events" },
  { label: "Sponsor Us", href: "/sponsor-us" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "Rotaract Platform";
  const orgSubName = process.env.NEXT_PUBLIC_ORG_SUB_NAME || "District & Club Platform";

  return (
    <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="w-full max-w-5xl glass-pill px-6 py-3 flex items-center justify-between pointer-events-auto border border-primary/10">
        <Link href="/" className="flex items-center space-x-3 select-none">
          <Image
            src="/favicon.ico"
            alt="Rotaract Club Logo"
            width={48}
            height={48}
            className="hover:scale-105 transition-transform"
          />
          <div className="flex flex-col -space-y-0.5">
            <span className="text-base font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">{appName}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">
              {orgSubName}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex items-center space-x-1 bg-primary/5 p-1 rounded-full border border-primary/10">
          {NAV_LINKS.map((item) => {
            const href = item.href;
            const isActive = pathname === href;
            return (
              <Link key={item.label} prefetch href={href}>
                <button
                  className={cn(
                    "text-xs font-semibold px-4 py-2 rounded-full transition-all duration-300 cursor-pointer select-none",
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
            <Button variant="ghost" size="icon" className="md:hidden cursor-pointer">
              <MenuIcon className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[280px] border-l border-zinc-200/40 dark:border-zinc-800/40 glass-panel">
            <div className="flex flex-col space-y-4 mt-8">
              {NAV_LINKS.map((item, index) => {
                const href = item.href;
                const isActive = pathname === href;
                return (
                  <Link
                    key={index}
                    prefetch
                    href={href}
                    className={cn(
                      "text-base font-semibold px-4 py-2.5 rounded-lg transition-colors",
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
