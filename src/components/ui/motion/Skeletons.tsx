"use client";

import React from "react";
import { cn } from "@/lib/utils";

// 1. HeroSkeleton
export function HeroSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 max-w-4xl mx-auto py-16", className)}>
      <div className="h-16 w-3/4 mx-auto rounded-2xl skeleton-shimmer" />
      <div className="h-6 w-1/2 mx-auto rounded-lg skeleton-shimmer" />
      <div className="flex justify-center gap-4 pt-4">
        <div className="h-12 w-32 rounded-full skeleton-shimmer" />
        <div className="h-12 w-32 rounded-full skeleton-shimmer" />
      </div>
    </div>
  );
}

// 2. CardSkeleton
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("h-[480px] bg-paper rounded-3xl overflow-hidden border border-hairline p-6 flex flex-col justify-between", className)}>
      <div className="space-y-6">
        <div className="h-[220px] w-full rounded-2xl skeleton-shimmer" />
        <div className="space-y-3">
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
          <div className="h-7 w-3/4 rounded-lg skeleton-shimmer" />
          <div className="h-12 w-full rounded-lg skeleton-shimmer" />
        </div>
      </div>
      <div className="h-10 w-full rounded-lg skeleton-shimmer border-t border-hairline pt-4" />
    </div>
  );
}

// 3. MemberSkeleton
export function MemberSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-col items-center p-6 space-y-4", className)}>
      <div className="w-24 h-24 rounded-full skeleton-shimmer" />
      <div className="h-6 w-1/2 rounded skeleton-shimmer" />
      <div className="h-4 w-1/3 rounded skeleton-shimmer" />
    </div>
  );
}

// 4. TableSkeleton
export function TableSkeleton({ rows = 5, cols = 4, className }: { rows?: number; cols?: number; className?: string }) {
  return (
    <div className={cn("w-full border border-hairline rounded-2xl overflow-hidden bg-paper", className)}>
      <div className="border-b border-hairline bg-wash p-4 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-5 flex-1 rounded skeleton-shimmer" />
        ))}
      </div>
      <div className="p-4 space-y-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, j) => (
              <div key={j} className="h-5 flex-1 rounded skeleton-shimmer" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// 5. TimelineSkeleton
export function TimelineSkeleton({ items = 3, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-8 relative pl-6 border-l-2 border-hairline", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="relative space-y-3">
          <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-paper bg-wash skeleton-shimmer" />
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
          <div className="h-6 w-1/2 rounded-lg skeleton-shimmer" />
          <div className="h-12 w-3/4 rounded-lg skeleton-shimmer" />
        </div>
      ))}
    </div>
  );
}

// 6. GallerySkeleton
export function GallerySkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="aspect-square rounded-2xl skeleton-shimmer" />
      ))}
    </div>
  );
}

// 7. ProfileSkeleton
export function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("bg-paper rounded-3xl p-8 border border-hairline space-y-8 max-w-3xl mx-auto", className)}>
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full skeleton-shimmer" />
        <div className="space-y-3 flex-1">
          <div className="h-6 w-1/3 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-hairline">
        <div className="space-y-4">
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
          <div className="h-10 w-full rounded-lg skeleton-shimmer" />
        </div>
        <div className="space-y-4">
          <div className="h-4 w-1/4 rounded skeleton-shimmer" />
          <div className="h-10 w-full rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
}

// 8. DashboardSkeleton
export function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 pb-20 mx-auto max-w-6xl w-full md:space-y-8", className)}>
      {/* Welcome Header */}
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-3 w-1/2">
          <div className="h-8 w-3/4 rounded-lg skeleton-shimmer" />
          <div className="h-4 w-1/2 rounded skeleton-shimmer" />
        </div>
        <div className="w-14 h-14 rounded-full skeleton-shimmer border border-hairline" />
      </div>

      {/* Today Section */}
      <div className="space-y-3">
        <div className="h-5 w-16 rounded skeleton-shimmer px-1" />
        <div className="bg-paper rounded-2xl p-5 border border-hairline shadow-sm flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="h-5 w-1/2 rounded skeleton-shimmer" />
            <div className="h-3 w-1/3 rounded skeleton-shimmer" />
          </div>
          <div className="h-9 w-16 rounded-xl skeleton-shimmer" />
        </div>
      </div>

      {/* Next Actions */}
      <div className="space-y-3">
        <div className="h-5 w-24 rounded skeleton-shimmer px-1" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-paper border border-hairline rounded-2xl p-4 flex items-center gap-3 min-w-[200px]">
              <div className="w-9 h-9 rounded-full skeleton-shimmer shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 rounded skeleton-shimmer" />
                <div className="h-3 w-1/2 rounded skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        <div className="h-5 w-24 rounded skeleton-shimmer px-1" />
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-hairline bg-paper p-4 md:p-5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg skeleton-shimmer shrink-0" />
              <div className="space-y-2 flex-1">
                <div className="h-3 w-1/2 rounded skeleton-shimmer" />
                <div className="h-6 w-3/4 rounded-lg skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
