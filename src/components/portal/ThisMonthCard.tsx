import Link from "next/link";
import { Cake, CalendarDays } from "lucide-react";
import { MemberAvatar } from "@/components/ui/member-avatar";
import { MonthBirthday, MonthEvent } from "@/features/members/queries/getThisMonthHighlights";

const MONTH_NAME = new Date().toLocaleString("en-US", { month: "long" });

const VARIANT_CLASSES: Record<"admin" | "portal", string> = {
  admin: "bg-white rounded-xl border border-slate-200",
  portal: "bg-wash rounded-2xl border border-hairline shadow-sm",
};

export function ThisMonthCard({
  birthdays,
  events,
  eventHrefBase,
  variant = "admin",
  className,
}: {
  birthdays: MonthBirthday[];
  events: MonthEvent[];
  eventHrefBase: string;
  variant?: "admin" | "portal";
  className?: string;
}) {
  if (birthdays.length === 0 && events.length === 0) return null;

  const isPortal = variant === "portal";
  const titleClass = isPortal ? "text-base font-semibold text-ink" : "text-sm font-semibold text-slate-900";
  const labelClass = isPortal ? "text-ink-faint" : "text-slate-400";
  const rowTextClass = isPortal ? "text-ink" : "text-slate-700";
  const dividerClass = isPortal ? "border-hairline" : "border-slate-100";

  return (
    <div className={`${VARIANT_CLASSES[variant]} p-5 space-y-4 ${className || ""}`}>
      <h2 className={titleClass}>This Month in {MONTH_NAME}</h2>

      {birthdays.length > 0 && (
        <div className="space-y-2.5">
          <p className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${labelClass}`}>
            <Cake className="w-3 h-3" /> Birthdays
          </p>
          <div className="space-y-2">
            {birthdays.map((b) => (
              <div key={b.id} className="flex items-center gap-2.5">
                <MemberAvatar name={b.name} avatarUrl={b.avatar} className="w-7 h-7 shrink-0" textClassName="text-[10px]" />
                <p className={`text-sm truncate flex-1 ${rowTextClass}`}>{b.name || "Member"}</p>
                <span className={`text-xs font-semibold shrink-0 ${b.isToday ? "text-brand" : labelClass}`}>
                  {b.isToday ? "Today" : `${MONTH_NAME.slice(0, 3)} ${b.day}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {events.length > 0 && (
        <div className={`space-y-2.5 ${birthdays.length > 0 ? `pt-3 border-t ${dividerClass}` : ""}`}>
          <p className={`text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 ${labelClass}`}>
            <CalendarDays className="w-3 h-3" /> Events
          </p>
          <div className="space-y-2">
            {events.map((e) => (
              <Link key={e.id} href={`${eventHrefBase}/${e.id}`} className="flex items-center justify-between gap-2 hover:text-brand transition-colors group">
                <p className={`text-sm group-hover:text-brand truncate flex-1 ${rowTextClass}`}>{e.title}</p>
                <span className={`text-xs font-semibold shrink-0 ${labelClass}`}>
                  {new Date(e.startTime).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
