"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Ruled row for events/announcements: date block, title, meta, arrow.
 * Table-of-contents feel, not card soup.
 */
export function ListRow({
  href,
  date,
  title,
  meta,
  tag,
  description,
  className,
}: {
  href?: string;
  date?: Date | string | null;
  title: string;
  meta?: string | null;
  tag?: string | null;
  description?: string | null;
  className?: string;
}) {
  const d = date ? new Date(date) : null;
  const month = d?.toLocaleString("default", { month: "short" });
  const day = d?.getDate();

  const inner = (
    <div
      className={cn(
        "group grid grid-cols-[64px_1fr_auto] items-baseline gap-x-5 md:gap-x-8 py-6 border-b border-hairline transition-colors",
        href && "hover:bg-wash/60 -mx-4 px-4 rounded-lg border-transparent [&+*]:border-t",
        className
      )}
    >
      <div className="text-center">
        {d ? (
          <>
            <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ochre-deep">
              {month}
            </span>
            <span className="block font-display font-medium text-2xl md:text-3xl text-ink leading-none mt-1 tabular-nums">
              {day}
            </span>
          </>
        ) : (
          <span className="block w-2 h-2 rounded-full bg-ochre mx-auto" aria-hidden="true" />
        )}
      </div>
      <div className="min-w-0">
        {tag && (
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1">
            {tag}
          </span>
        )}
        <h3 className="font-display font-medium text-lg md:text-xl text-ink leading-snug text-balance">
          {title}
        </h3>
        {meta && <p className="text-[13px] font-medium text-ink-faint mt-1.5">{meta}</p>}
        {description && (
          <p className="text-[15px] text-ink-soft mt-2 leading-relaxed line-clamp-2">{description}</p>
        )}
      </div>
      {href && (
        <span className="text-ochre transition-transform duration-200 group-hover:translate-x-1 self-center" aria-hidden="true">
          →
        </span>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {inner}
    </Link>
  ) : (
    inner
  );
}

/** Editorial ruled row for milestones, schedules, project phases. */
export function TimelineRow({
  marker,
  title,
  description,
  meta,
  children,
  className,
}: {
  marker: string;
  title: string;
  description?: string | null;
  meta?: string | null;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-3 py-8 border-b border-hairline", className)}>
      <div className="md:col-span-3">
        <span className="font-display font-medium italic text-2xl md:text-3xl text-ochre-deep leading-none">
          {marker}
        </span>
        {meta && <p className="text-[13px] font-medium text-ink-faint mt-2">{meta}</p>}
      </div>
      <div className="md:col-span-8">
        <h3 className="font-display font-medium text-xl md:text-2xl text-ink leading-snug text-balance">{title}</h3>
        {description && (
          <p className="text-[15px] text-ink-soft mt-3 leading-relaxed max-w-2xl">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
}
