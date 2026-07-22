import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Shared portal (admin + member dashboard) page anatomy.
 * Every portal page should compose these instead of hand-rolling
 * headers, stat cards, and tables.
 */

/** Standard page header: back link, title, description, action buttons. */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel,
  actions,
  className,
}: {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-6 md:mb-8", className)}>
      {backHref && (
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLabel || "Back"}
        </Link>
      )}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-ink">{title}</h1>
          {description && <p className="text-sm text-ink-soft mt-1.5 max-w-2xl">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

/** Stat card with consistent tones. Use inside a StatGrid. */
export function StatCard({
  label,
  value,
  icon: Icon,
  tone = "neutral",
  hint,
  className,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "neutral" | "positive" | "warning" | "critical" | "brand";
  hint?: string;
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-wash text-ink-soft",
    positive: "bg-wash text-gold",
    warning: "bg-wash text-gold",
    critical: "bg-wash text-brand",
    brand: "bg-wash text-brand",
  };
  return (
    <div className={cn("rounded-xl border border-hairline bg-paper p-4 md:p-5", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <span className={cn("rounded-lg p-2 shrink-0", tones[tone])}>
            <Icon className="w-4 h-4" />
          </span>
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-ink-soft truncate">{label}</p>
          <p className="text-xl md:text-2xl font-display font-bold text-ink tabular-nums leading-tight">
            {value}
          </p>
        </div>
      </div>
      {hint && <p className="text-xs text-ink-faint mt-2">{hint}</p>}
    </div>
  );
}

/** Responsive stat grid: 2-up on phones, up to N on desktop. */
export function StatGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4", className)}>
      {children}
    </div>
  );
}

/**
 * Table container: horizontal scroll on desktop widths, and an optional
 * card-list replacement on mobile. Pass the `<table>` as children and a
 * `mobile` node (stacked cards) — the table hides below md when mobile
 * cards are provided.
 */
export function TableWrap({
  children,
  mobile,
  className,
}: {
  children: React.ReactNode;
  mobile?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-xl border border-hairline bg-paper", className)}>
      {mobile && <div className="md:hidden divide-y divide-hairline/50">{mobile}</div>}
      <div className={cn("overflow-x-auto", mobile && "hidden md:block")}>{children}</div>
    </div>
  );
}

/** Consistent portal empty state. */
export function PortalEmptyState({
  title,
  detail,
  action,
  className,
}: {
  title: string;
  detail?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("py-14 px-6 text-center", className)}>
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      {detail && <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">{detail}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  );
}
