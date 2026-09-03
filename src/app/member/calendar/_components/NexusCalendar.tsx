"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, CalendarDays, Cake, Briefcase, Users, Sparkles } from "lucide-react";
import type { CalendarEntry } from "@/features/members/queries/getNexusCalendarData";
import { formatIST } from "@/lib/date-utils";

// Calendar entries carry a plain "YYYY-MM-DD" calendar date (no time-of-day
// meaning). Anchoring at UTC midnight then formatting in Asia/Kolkata keeps
// the displayed day stable regardless of the viewer's/server's local zone
// (UTC midnight is 05:30 IST the same date, never a day early/late).
function dateKeyToDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const TYPE_META: Record<CalendarEntry["type"], { label: string; color: string; bg: string; icon: React.ElementType }> = {
  EVENT:         { label: "Event",    color: "#D41367", bg: "bg-pink-50 border-pink-200 text-pink-700",      icon: Sparkles },
  MEETING:       { label: "Meeting",  color: "#F59E0B", bg: "bg-amber-50 border-amber-200 text-amber-700",   icon: Users },
  PROJECT_START: { label: "Project",  color: "#10B981", bg: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: Briefcase },
  PROJECT_END:   { label: "Project",  color: "#10B981", bg: "bg-emerald-50 border-emerald-200 text-emerald-700", icon: Briefcase },
  BIRTHDAY:      { label: "Birthday", color: "#8B5CF6", bg: "bg-violet-50 border-violet-200 text-violet-700", icon: Cake },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

function toDateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function formatDateLabel(dateStr: string) {
  return formatIST(dateKeyToDate(dateStr), "EEEE, d MMMM yyyy");
}

// ─── Types ───────────────────────────────────────────────────────────────────

interface Props {
  entries: CalendarEntry[];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function NexusCalendar({ entries }: Props) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(
    today.toISOString().split("T")[0]
  );
  const [activeFilter, setActiveFilter] = useState<CalendarEntry["type"] | "ALL">("ALL");

  // ── Index entries by date key ─────────────────────────────────────────────
  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarEntry[]>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return map;
  }, [entries]);

  // ── Selected date entries ─────────────────────────────────────────────────
  const selectedEntries = useMemo(() => {
    if (!selectedDate) return [];
    const all = entriesByDate.get(selectedDate) || [];
    return activeFilter === "ALL" ? all : all.filter(e => e.type === activeFilter);
  }, [selectedDate, entriesByDate, activeFilter]);

  // ── Upcoming entries (next 30 days from today) for list view ─────────────
  const upcomingEntries = useMemo(() => {
    const todayStr = today.toISOString().split("T")[0];
    const cutoff = new Date(today);
    cutoff.setDate(cutoff.getDate() + 60);
    const cutoffStr = cutoff.toISOString().split("T")[0];
    return entries.filter(e => e.date >= todayStr && e.date <= cutoffStr && (activeFilter === "ALL" || e.type === activeFilter));
  }, [entries, activeFilter]);

  // ── Calendar grid ────────────────────────────────────────────────────────
  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const todayStr = today.toISOString().split("T")[0];

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };
  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelectedDate(todayStr);
  };

  // ── Legend / filter types ────────────────────────────────────────────────
  const filterTypes: Array<CalendarEntry["type"] | "ALL"> = ["ALL", "EVENT", "MEETING", "PROJECT_START", "BIRTHDAY"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">

      {/* ── Left: Calendar Grid ── */}
      <div className="bg-paper rounded-2xl border border-hairline shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <button
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-wash transition text-ink-soft hover:text-ink"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h2 className="text-base font-bold text-ink w-44 text-center select-none">
              {MONTHS[viewMonth]} {viewYear}
            </h2>
            <button
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-wash transition text-ink-soft hover:text-ink"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="text-xs font-bold px-3 py-1.5 rounded-lg bg-brand/10 text-brand hover:bg-brand/20 transition"
          >
            Today
          </button>
        </div>

        {/* Filter pills */}
        <div className="flex gap-2 px-5 py-3 border-b border-hairline overflow-x-auto scrollbar-hide">
          {filterTypes.map(type => {
            const isActive = activeFilter === type;
            const meta = type === "ALL" ? null : TYPE_META[type];
            return (
              <button
                key={type}
                onClick={() => setActiveFilter(type)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isActive
                    ? "bg-ink text-paper border-ink shadow-sm scale-[1.03]"
                    : "bg-wash border-hairline text-ink-soft hover:border-ink-soft hover:text-ink"
                }`}
              >
                {meta && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: meta.color }} />}
                {type === "ALL" ? "All" : type === "PROJECT_START" ? "Projects" : meta!.label}
              </button>
            );
          })}
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 border-b border-hairline">
          {WEEKDAYS.map(d => (
            <div key={d} className="py-2 text-center text-[10px] font-bold text-ink-faint uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[72px] border-b border-r border-hairline bg-wash/30 last:border-r-0" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const col = (firstDay + i) % 7;
            const dateKey = toDateKey(viewYear, viewMonth, day);
            const dayEntries = entriesByDate.get(dateKey) || [];
            const filtered = activeFilter === "ALL" ? dayEntries : dayEntries.filter(e => e.type === activeFilter);
            const isToday = dateKey === todayStr;
            const isSelected = dateKey === selectedDate;
            const isWeekend = col === 0 || col === 6;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(dateKey)}
                className={`min-h-[72px] border-b border-r border-hairline p-1.5 text-left transition-colors relative group
                  ${col === 6 ? "border-r-0" : ""}
                  ${isSelected ? "bg-brand/5 ring-1 ring-inset ring-brand/30" : isWeekend ? "bg-wash/40 hover:bg-wash" : "hover:bg-wash"}
                `}
              >
                {/* Day number */}
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold mb-1 transition-colors
                    ${isToday ? "bg-brand text-white" : isSelected ? "text-brand" : isWeekend ? "text-ink-faint" : "text-ink"}
                  `}
                >
                  {day}
                </span>

                {/* Entry dots / chips */}
                <div className="flex flex-col gap-0.5">
                  {filtered.slice(0, 3).map(e => (
                    <span
                      key={e.id}
                      className="block truncate text-[10px] font-semibold rounded px-1 py-0.5 leading-tight"
                      style={{ backgroundColor: `${e.color}18`, color: e.color }}
                    >
                      {e.title}
                    </span>
                  ))}
                  {filtered.length > 3 && (
                    <span className="text-[10px] font-bold text-ink-faint pl-1">
                      +{filtered.length - 3} more
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Right: Day Detail + Upcoming ── */}
      <div className="flex flex-col gap-4">

        {/* Selected Day Panel */}
        {selectedDate && (
          <div className="bg-paper rounded-2xl border border-hairline shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-hairline flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-brand" />
              <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                {formatDateLabel(selectedDate)}
              </p>
            </div>
            {selectedEntries.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-ink-faint">Nothing scheduled</p>
              </div>
            ) : (
              <div className="divide-y divide-hairline max-h-[320px] overflow-y-auto">
                {selectedEntries.map(e => {
                  const meta = TYPE_META[e.type];
                  const Icon = meta.icon;
                  const inner = (
                    <div
                      key={e.id}
                      className="flex items-start gap-3 px-4 py-3 hover:bg-wash transition-colors"
                    >
                      <span
                        className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${meta.color}18` }}
                      >
                        <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-ink leading-tight truncate">{e.title}</p>
                        {e.subtitle && (
                          <p className="text-xs text-ink-soft mt-0.5 truncate">{e.subtitle}</p>
                        )}
                        <span
                          className="inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>
                  );
                  return e.href ? (
                    <Link href={e.href} key={e.id}>{inner}</Link>
                  ) : (
                    <div key={e.id}>{inner}</div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Upcoming 60 Days */}
        <div className="bg-paper rounded-2xl border border-hairline shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-hairline">
            <p className="text-xs font-bold text-ink-soft uppercase tracking-wider">Upcoming — Next 60 Days</p>
          </div>
          {upcomingEntries.length === 0 ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-ink-faint">Nothing coming up</p>
            </div>
          ) : (
            <div className="divide-y divide-hairline max-h-[400px] overflow-y-auto">
              {upcomingEntries.map(e => {
                const meta = TYPE_META[e.type];
                const Icon = meta.icon;
                const dateObj = dateKeyToDate(e.date);
                const dateLabel = formatIST(dateObj, "d MMM");
                const inner = (
                  <div className="flex items-center gap-3 px-4 py-3 hover:bg-wash transition-colors">
                    <div className="flex-shrink-0 text-center w-10">
                      <p className="text-[10px] font-bold text-ink-faint uppercase">
                        {formatIST(dateObj, "MMM")}
                      </p>
                      <p className="text-lg font-black text-ink leading-none">
                        {formatIST(dateObj, "d")}
                      </p>
                    </div>
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${meta.color}18` }}
                    >
                      <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-ink truncate">{e.title}</p>
                      {e.subtitle && <p className="text-xs text-ink-soft truncate">{e.subtitle}</p>}
                    </div>
                    <span
                      className="flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ backgroundColor: `${meta.color}18`, color: meta.color }}
                    >
                      {meta.label}
                    </span>
                  </div>
                );
                return e.href ? (
                  <Link href={e.href} key={e.id}>{inner}</Link>
                ) : (
                  <div key={e.id}>{inner}</div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
