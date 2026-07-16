import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb } from "lucide-react";
import { PageHeader } from "@/components/portal";
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
      <PageHeader
        title={event.title}
        description={event.description || undefined}
        backHref="/admin/events"
        backLabel="Back to Events"
        actions={
          <>
            <EventSettingsButton event={event} />
            <EventPublishButton event={event} template={{ subject: renderedSubject, body: renderedBody }} />
          </>
        }
        className="mb-0"
      />

      {event.initiative && (
        <div className="inline-flex items-center gap-2 text-sm bg-pink-50 border border-pink-100 text-brand-deep px-4 py-2 rounded-xl">
          <Lightbulb className="w-4 h-4" />
          Originally proposed by <span className="font-semibold">{event.initiative.proposedBy?.name || "a member"}</span>
          <Link href={`/admin/proposals/${event.initiative.id}`} className="underline hover:text-brand">View proposal</Link>
        </div>
      )}

      <EventDashboard event={event as any} />
    </div>
  );
}
