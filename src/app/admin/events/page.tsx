import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  Plus,
  FolderOpen,
  MoreVertical,
  SlidersHorizontal
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilterBar from "@/components/admin/FilterBar";
import DeleteButton from "@/components/admin/DeleteButton";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default async function EventsAdmin(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const tab = searchParams.tab || "upcoming";

  const now = new Date();
  const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000);

  let eventWhere: any = {};
  if (tab === "upcoming") {
    eventWhere = {
        status: { in: ["UPCOMING", "ONGOING"] },
        OR: [
            { endTime: { gte: now } },
            { endTime: null, startTime: { gte: fourHoursAgo } }
        ]
    };
  } else if (tab === "completed") {
    eventWhere = {
        OR: [
            { status: "COMPLETED" },
            {
                status: { in: ["UPCOMING", "ONGOING"] },
                OR: [
                    { endTime: { lt: now } },
                    { endTime: null, startTime: { lt: fourHoursAgo } }
                ]
            }
        ]
    };
  } else if (tab === "drafts") {
    eventWhere.status = "DRAFT";
  }

  if (search) {
    eventWhere.title = { contains: search, mode: "insensitive" };
  }

  const events = await prisma.event.findMany({
    where: eventWhere,
    include: {
      project: { select: { title: true } },
      _count: { select: { registrations: true } },
      media: {
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { id: true, url: true }
      }
    },
    orderBy: { startTime: "asc" }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events</h1>
          <p className="text-slate-500 text-sm mt-0.5">Plan and manage club activities.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/admin/events/create" className="flex items-center gap-1.5">
            <Plus className="w-4 h-4" /> Create Event
          </Link>
        </Button>
      </div>

      {/* Tabs list */}
      <div className="border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex gap-4 text-sm w-full overflow-x-auto hide-scrollbar">
          {[
            { id: "upcoming", label: "Upcoming" },
            { id: "completed", label: "Completed" },
            { id: "drafts", label: "Drafts" },
            { id: "all", label: "All" }
          ].map(t => {
            const active = tab === t.id;
            // Build tab link
            const url = `/admin/events?tab=${t.id}${search ? `&search=${search}` : ""}`;
            return (
              <Link 
                key={t.id} 
                href={url}
                className={`pb-3 font-medium border-b-2 transition-all whitespace-nowrap ${
                  active 
                    ? "border-slate-900 text-slate-900 font-semibold" 
                    : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
        <div className="pb-2 w-full sm:w-auto">
          <FilterBar placeholder="Search events..." />
        </div>
      </div>

      {/* Grid listing */}
      {events.length === 0 ? (
        <div className="border border-dashed border-slate-300 rounded-xl p-16 text-center max-w-xl mx-auto mt-8 space-y-4">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-800">No events yet</h3>
            <p className="text-sm text-slate-400">
              Create your first event and start managing registrations, attendance and reports.
            </p>
          </div>
          <Button asChild size="sm" className="mt-2">
            <Link href="/admin/events/create">Create Event</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const thumb = event.media?.find((m) => m.id === event.bannerMediaId) || event.media?.[0];
            
            let displayStatus = event.status;
            if (event.status === "UPCOMING" || event.status === "ONGOING") {
               const eventEndTime = event.endTime ? new Date(event.endTime) : null;
               const eventStartTime = new Date(event.startTime);
               if (eventEndTime && eventEndTime < now) displayStatus = "COMPLETED" as any;
               else if (!eventEndTime && eventStartTime < fourHoursAgo) displayStatus = "COMPLETED" as any;
            }

            return (
            <div key={event.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-all">
              {/* Event Cover Image Placeholder / Color Block */}
              <div className="h-32 bg-slate-100 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
                {thumb?.url ? (
                  <Image
                    src={thumb.url}
                    alt={event.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <Calendar className="w-8 h-8 text-slate-300" />
                )}
                <div className="absolute top-3 left-3 flex gap-1">
                  <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm text-slate-900 shadow-sm border-none">
                    {event.type.replace(/_/g, " ")}
                  </Badge>
                  <Badge className={`shadow-sm border-none ${
                    displayStatus === "UPCOMING" 
                      ? "bg-sky-500 text-white" 
                      : displayStatus === "COMPLETED" 
                      ? "bg-emerald-500 text-white" 
                      : "bg-slate-500 text-white"
                  }`}>
                    {displayStatus}
                  </Badge>
                </div>
              </div>

              {/* Event Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      {event.title}
                    </h3>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2">
                          <MoreVertical className="w-4 h-4 text-slate-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/events/${event.id}`}>Manage</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600 focus:text-rose-600">
                          <DeleteButton endpoint="/api/admin/events" id={event.id} confirmMessage="Delete this event?" />
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  {event.project && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>{event.project.title}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      {new Date(event.startTime).toLocaleDateString("en-US", { 
                        weekday: "short", 
                        month: "short", 
                        day: "numeric", 
                        hour: "2-digit", 
                        minute: "2-digit" 
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{event.location || "Online / TBD"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs text-slate-500 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-medium">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    {event._count.registrations} registrations
                  </span>
                  {event.capacity && (
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">
                      Cap: {event.capacity}
                    </span>
                  )}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex justify-end gap-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/admin/events/${event.id}`}>Manage</Link>
                </Button>
              </div>

            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
