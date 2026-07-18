import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import {
  Calendar,
  Users,
  Plus,
  ArrowRight,
  Clock,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  ChevronRight,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import FilterBar from "@/components/admin/FilterBar";
import { PageHeader, PortalEmptyState } from "@/components/portal";

// ─── Status pill ─────────────────────────────────────────────────────────────

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    DRAFT: "bg-slate-100 text-slate-600",
    UPCOMING: "bg-sky-100 text-sky-700",
    ONGOING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-emerald-100 text-emerald-700",
    CANCELLED: "bg-red-100 text-red-600",
    PLANNING: "bg-purple-100 text-purple-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
        map[status] || "bg-slate-100 text-slate-500"
      }`}
    >
      {status}
    </span>
  );
}

// ─── Date block ──────────────────────────────────────────────────────────────

function DateBlock({ date }: { date: Date }) {
  const d = new Date(date);
  return (
    <div className="flex-none w-12 text-center">
      <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
        {d.toLocaleDateString(undefined, { month: "short" })}
      </div>
      <div className="text-xl font-black text-slate-900 leading-none">
        {d.getDate()}
      </div>
    </div>
  );
}

// ─── Row ─────────────────────────────────────────────────────────────────────

function EventRow({ event }: { event: any }) {
  return (
    <Link
      href={`/admin/events/${event.id}`}
      className="flex items-center gap-4 px-4 py-3.5 hover:bg-slate-50 transition-colors rounded-xl group"
    >
      <DateBlock date={event.startTime} />
      <div className="flex-1 min-w-0 space-y-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-semibold text-slate-900 group-hover:text-brand transition-colors truncate">
            {event.title}
          </span>
          <StatusPill status={event.status} />
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
          {event.location && (
            <span className="truncate max-w-[180px]">{event.location}</span>
          )}
          {event.project && (
            <span className="text-slate-400">↳ {event.project.title}</span>
          )}
        </div>
      </div>
      <div className="flex-none flex items-center gap-3">
        <span className="hidden sm:flex items-center gap-1 text-xs text-slate-400">
          <Users className="w-3.5 h-3.5" />
          {event._count.registrations}
        </span>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-brand group-hover:translate-x-0.5 transition-all" />
      </div>
    </Link>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({
  label,
  icon,
  count,
}: {
  label: string;
  icon?: React.ReactNode;
  count?: number;
}) {
  return (
    <div className="flex items-center gap-2 px-4 pt-6 pb-2 border-b border-slate-100 mb-2">
      {icon}
      <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
      {count !== undefined && (
        <span className="ml-auto text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">{count}</span>
      )}
    </div>
  );
}

// ─── Month Separator ──────────────────────────────────────────────────────────

function MonthSeparator({ date }: { date: Date }) {
  const d = new Date(date);
  const monthYear = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  return (
    <div className="px-4 py-2 mt-2 bg-slate-50 border-y border-slate-100 text-xs font-semibold text-slate-500 sticky top-0 z-10">
      {monthYear}
    </div>
  );
}

// ─── Category Chips ──────────────────────────────────────────────────────────

import { EventType } from "@prisma/client";

function CategoryFilters({ currentCategory }: { currentCategory: string }) {
  const categories: { label: string; value: string }[] = [
    { label: "All Types", value: "" },
    { label: "Meeting", value: "MEETING" },
    { label: "Community Service", value: "COMMUNITY_SERVICE" },
    { label: "Professional Dev", value: "PROFESSIONAL_DEVELOPMENT" },
    { label: "Club Service", value: "CLUB_SERVICE" },
    { label: "International", value: "INTERNATIONAL_SERVICE" },
    { label: "Fundraiser", value: "FUNDRAISER" },
    { label: "Fellowship", value: "FELLOWSHIP" },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {categories.map((c) => (
        <Link
          key={c.value}
          href={c.value ? `?category=${c.value}` : "?"}
          className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${
            currentCategory === c.value
              ? "bg-brand text-white border-brand"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

import EventsHeader from "@/app/admin/events/_components/EventsHeader";

export default async function EventsAdmin(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const category = searchParams.category || "";
  const limitParam = parseInt(searchParams.limit || "50", 10);
  const limit = Math.min(Math.max(limitParam, 1), 200);

  const club = await getCurrentClub();
  if (!club) return null;

  const now = new Date();
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const twoYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate());

  const baseInclude = {
    project: { select: { title: true } },
    _count: { select: { registrations: true } },
  };

  const baseWhere: any = {
    clubId: club.id,
    startTime: { gte: twoYearsAgo }, // Prevent unbounded history scaling issues
    ...(search ? { title: { contains: search, mode: "insensitive" } } : {}),
    ...(category ? { type: category } : {}),
  };

  // ONE query, fetching events ordered by descending start time
  const events = await prisma.event.findMany({
    where: baseWhere,
    include: baseInclude,
    orderBy: { startTime: "desc" },
    take: limit,
  });

  // Exhaustive bucketing in JS
  const needsAttention = [];
  const upcoming = [];
  const drafts = [];
  const planning = [];
  const past = [];
  const other = []; // Fallback

  for (const event of events) {
    const status = event.status;
    const startTime = event.startTime;
    const endTime = event.endTime;

    const isStarted = startTime <= now;
    const isPlausiblyLive = isStarted && (endTime ? endTime > now : startTime > twentyFourHoursAgo);

    if (status === "ONGOING" || (status === "UPCOMING" && isPlausiblyLive) || (status === "DRAFT" && isStarted)) {
      needsAttention.push(event);
    } else if (status === "UPCOMING") {
      if (startTime > now) {
        upcoming.push(event);
      } else {
        past.push(event);
      }
    } else if (status === "DRAFT") {
      drafts.push(event);
    } else if (status === "PLANNING") {
      planning.push(event);
    } else if (status === "COMPLETED" || status === "CANCELLED") {
      past.push(event);
    } else {
      other.push(event);
    }
  }

  // Reverse future-facing buckets so the soonest event is first
  needsAttention.reverse();
  upcoming.reverse();
  drafts.reverse();
  planning.reverse();

  const totalVisible = events.length;
  const hasMore = events.length === limit;

  // Helper to render lists with month separators
  const renderListWithMonths = (list: any[]) => {
    let currentMonth = "";
    return list.map((event) => {
      const d = new Date(event.startTime);
      const m = d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
      const isNewMonth = m !== currentMonth;
      if (isNewMonth) currentMonth = m;
      
      return (
        <div key={event.id}>
          {isNewMonth && <MonthSeparator date={event.startTime} />}
          <EventRow event={event} />
        </div>
      );
    });
  };

  return (
    <div className="max-w-5xl mx-auto py-8 space-y-4 px-4 sm:px-0">
      <PageHeader
        title="Events"
        description="Plan and manage club activities."
        actions={
          <Button asChild size="sm" className="bg-brand hover:bg-brand-deep text-white w-full sm:w-auto">
            <Link href="/admin/events/create" className="flex items-center gap-1.5 justify-center">
              <Plus className="w-4 h-4" /> Create Event
            </Link>
          </Button>
        }
      />

      <div className="flex flex-col gap-4 mb-4">
        <EventsHeader />
        <FilterBar placeholder="Search events..." />
        <CategoryFilters currentCategory={category} />
      </div>

      {totalVisible === 0 ? (
        <PortalEmptyState
          title="No events found"
          detail="Try adjusting your filters or create a new event."
          action={<Button asChild><Link href="/admin/events/create">Create Event</Link></Button>}
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          {needsAttention.length > 0 && (
            <details open className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Needs attention" icon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />} count={needsAttention.length} />
              </summary>
              <div className="px-2 pb-2">
                {needsAttention.map((event) => <EventRow key={event.id} event={event} />)}
              </div>
            </details>
          )}

          {upcoming.length > 0 && (
            <details open className="group">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Upcoming" icon={<Calendar className="w-3.5 h-3.5 text-sky-500" />} count={upcoming.length} />
              </summary>
              <div className="px-2 pb-2">
                {renderListWithMonths(upcoming)}
              </div>
            </details>
          )}

          {planning.length > 0 && (
            <details open className="group">
              <summary className="list-none cursor-pointer border-t border-slate-100">
                <SectionLabel label="Planning" icon={<Briefcase className="w-3.5 h-3.5 text-purple-400" />} count={planning.length} />
              </summary>
              <div className="px-2 pb-2">
                {planning.map((event) => <EventRow key={event.id} event={event} />)}
              </div>
            </details>
          )}

          {drafts.length > 0 && (
            <details className="group">
              <summary className="list-none cursor-pointer border-t border-slate-100">
                <SectionLabel label="Drafts" icon={<Clock className="w-3.5 h-3.5 text-slate-400" />} count={drafts.length} />
              </summary>
              <div className="px-2 pb-2">
                {drafts.map((event) => <EventRow key={event.id} event={event} />)}
              </div>
            </details>
          )}

          {past.length > 0 && (
            <details className="group border-t border-slate-100">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Past" icon={<Users className="w-3.5 h-3.5 text-slate-300" />} count={past.length} />
              </summary>
              <div className="px-2 pb-2">
                {renderListWithMonths(past)}
                
                {hasMore && (
                  <div className="p-4 text-center border-t border-slate-100 mt-2">
                    <Button variant="outline" asChild size="sm">
                      <Link href={`?limit=${limit + 50}${category ? `&category=${category}` : ''}${search ? `&search=${search}` : ''}`}>
                        Load older events
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </details>
          )}

          {other.length > 0 && (
            <details className="group border-t border-slate-100">
              <summary className="list-none cursor-pointer">
                <SectionLabel label="Other" icon={<HelpCircle className="w-3.5 h-3.5 text-slate-300" />} count={other.length} />
              </summary>
              <div className="px-2 pb-2">
                {other.map((event) => <EventRow key={event.id} event={event} />)}
              </div>
            </details>
          )}
        </div>
      )}
    </div>
  );
}
