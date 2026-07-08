import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
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
      media: { orderBy: { createdAt: "desc" } }
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
      <div className="flex items-center justify-between">
        <Link href="/admin/events" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Events
        </Link>
        <div className="flex items-center gap-3">
          <EventSettingsButton event={event} />
          <EventPublishButton event={event} template={{ subject: renderedSubject, body: renderedBody }} />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{event.title}</h1>
        {event.description && <p className="text-gray-500 max-w-3xl leading-relaxed">{event.description}</p>}
      </div>

      <EventDashboard event={event as any} />
    </div>
  );
}
