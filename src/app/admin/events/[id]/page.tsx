import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Lightbulb } from "lucide-react";
import EventDashboard from "./_components/EventDashboard";
import EventSettingsButton from "./_components/EventSettingsButton";
import EventPublishButton from "./_components/EventPublishButton";
import { getTemplate, renderTemplate } from "@/features/communication/services/templateService";

export default async function EventManagementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      club: true,
      project: { select: { title: true } },
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: {
          member: { select: { name: true, email: true } }
        }
      },
      minutes: { select: { content: true } },
      attendance: { select: { id: true, memberId: true } },
      transactions: { select: { id: true, title: true, amount: true, type: true, status: true } },
      media: { orderBy: { createdAt: "desc" } },
      initiative: { select: { id: true, proposedBy: { select: { name: true, avatar: true } } } }
    }
  });

  if (!event) notFound();

  const templateObj = await getTemplate(event.clubId, "EVENT_PUBLISHED");
  const renderedSubject = renderTemplate(templateObj.subjectTemplate, {
    clubName: event.club.name,
    eventName: event.title,
    eventDate: event.startDate ? new Date(event.startDate).toLocaleDateString() : "",
    venue: event.location || "TBA",
    link: `https://yourdomain.com/events/${event.id}` // Ideally dynamic
  });
  const renderedBody = renderTemplate(templateObj.bodyTemplate, {
    clubName: event.club.name,
    eventName: event.title,
    eventDate: event.startDate ? new Date(event.startDate).toLocaleDateString() : "",
    venue: event.location || "TBA",
    link: `https://yourdomain.com/events/${event.id}`
  });

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Back to Events</span>
          <span className="sm:hidden">Back</span>
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <EventSettingsButton event={event} />
          <EventPublishButton event={event} template={{ subject: renderedSubject, body: renderedBody }} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
        {event.description && <p className="text-gray-500 max-w-3xl leading-relaxed whitespace-pre-wrap">{event.description}</p>}
      </div>

      {event.initiative && (
        <div className="inline-flex items-center gap-2 text-sm bg-purple-50 border border-purple-100 text-purple-700 px-4 py-2 rounded-xl">
          <Lightbulb className="w-4 h-4" />
          Originally proposed by <span className="font-bold">{event.initiative.proposedBy?.name || "a member"}</span>
          <Link href={`/admin/proposals/${event.initiative.id}`} className="underline hover:text-purple-900">View proposal</Link>
        </div>
      )}

      <EventDashboard event={event as any} />
    </div>
  );
}
