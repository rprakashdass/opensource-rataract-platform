"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/** The one primary action: ochre pill, sentence case. */
export function PillLink({
  href,
  children,
  onDark,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "motion-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold transition-colors",
        onDark
          ? "bg-ochre text-chapter hover:bg-parchment"
          : "bg-ochre text-white hover:bg-ochre-deep",
        className
      )}
    >
      {children}
    </Link>
  );
}

/** The quiet secondary action: drawn-underline text link. */
export function QuietLink({
  href,
  children,
  onDark,
  className,
}: {
  href: string;
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "thadam-link text-[15px] font-semibold",
        onDark ? "text-parchment" : "text-ink",
        className
      )}
    >
      {children} →
    </Link>
  );
}
