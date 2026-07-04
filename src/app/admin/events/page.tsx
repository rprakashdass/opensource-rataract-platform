import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Trash2, Pencil, Users } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function EventsAdmin() {
  const [initiatives, events, initiativeCount, eventCount, upcomingEventsCount] = await Promise.all([
    prisma.initiative.findMany({
      include: {
        events: {
          select: { id: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.event.findMany({
      include: {
        initiative: {
          select: { title: true, slug: true },
        },
      },
      orderBy: { startDate: "desc" },
    }),
    prisma.initiative.count(),
    prisma.event.count(),
    prisma.event.count({
      where: {
        startDate: { gte: new Date() }
      }
    })
  ]);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-pink-700">Events</span>
          <h1 className="text-3xl font-bold text-gray-900">Initiatives and instances</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            The overview stays clean and readable. Use the creation page when you want to add a new initiative or a new event instance.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/events/new?section=initiative" className="inline-flex items-center justify-center rounded-md bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition">
            Create Initiative
          </Link>
          <Link href="/admin/events/new?section=event" className="inline-flex items-center justify-center rounded-md border border-pink-200 bg-white px-4 py-2 text-sm font-medium text-pink-700 hover:bg-pink-50 transition">
            Create Event Instance
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Initiatives</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{initiativeCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Event instances</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{eventCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Upcoming events</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{upcomingEventsCount}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Created initiatives</h2>
              <p className="text-sm text-gray-500">One card per initiative, with all linked instances underneath.</p>
            </div>
            <Link href="/admin/events/new?section=initiative" className="text-sm font-medium text-pink-700 hover:underline">
              Add new
            </Link>
          </div>

          {initiatives.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No initiatives yet.
            </div>
          ) : (
            <div className="space-y-4">
              {initiatives.map((initiative) => (
                <div key={initiative.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{initiative.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{initiative.events.length} linked instances</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-pink-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-pink-700">
                        {initiative.frequency}
                      </span>
                      <Link href={`/admin/events/new?initiativeEdit=${initiative.id}`} className="text-gray-400 hover:text-indigo-600 transition" title="Edit Initiative">
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <DeleteButton endpoint="/api/admin/initiatives" id={initiative.id} confirmMessage="Delete this initiative?" />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600 line-clamp-2">{initiative.description || "No description set."}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Created event instances</h2>
              <p className="text-sm text-gray-500">Manual entries that belong to an initiative or stand alone.</p>
            </div>
            <Link href="/admin/events/new?section=event" className="text-sm font-medium text-pink-700 hover:underline">
              Add new
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
              No event instances yet.
            </div>
          ) : (
            <div className="space-y-4 max-h-[620px] overflow-auto pr-1">
              {events.map((event) => (
                <div key={event.id} className="rounded-xl border border-gray-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{event.title}</div>
                      <div className="text-xs text-gray-500 mt-1">{new Date(event.startDate).toLocaleString()}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-gray-700">
                        {event.status}
                      </span>
                      <Link href={`/admin/events/${event.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 px-3 py-1.5 text-xs font-semibold text-purple-700 hover:bg-purple-100 transition" title="Manage Event">
                        Manage Event
                      </Link>
                      <DeleteButton endpoint="/api/admin/events" id={event.id} confirmMessage="Delete this event?" />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    {event.initiative?.title || "Standalone"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
