import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, ClipboardCheck, FileText } from "lucide-react";
import { PageHeader } from "@/components/portal";
import { Button } from "@/components/ui/button";
import EventDashboard from "./_components/EventDashboard";
import EventSettingsButton from "./_components/EventSettingsButton";
import EventReadiness from "./_components/EventReadiness";
import EventPublishButton from "./_components/EventPublishButton";
import DeleteEventButton from "./_components/DeleteEventButton";
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
      transactions: { select: { id: true, title: true, amount: true, type: true, status: true, receiptUrl: true } },
      budget: { select: { id: true, allocatedAmount: true } },
      media: { orderBy: { createdAt: "desc" } },
      members: { select: { memberId: true, role: true } },
      initiative: { select: { id: true, proposedBy: { select: { name: true, avatar: true } } } }
    }
  });

  if (!event) notFound();

  const clubMembers = await prisma.member.findMany({
    where: { clubId: event.clubId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  const accounts = await prisma.account.findMany({
    where: { clubId: event.clubId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

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
        backHref="/admin/events"
        backLabel="Back to Events"
        actions={
          <>
            <Link href={`/admin/events/${event.id}/attendance`}>
              <Button variant="outline" className="gap-2"><ClipboardCheck className="w-4 h-4" /> Attendance</Button>
            </Link>
            <Link href={`/reports/events/${event.id}?source=admin`} target="_blank">
              <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Report</Button>
            </Link>
            <EventSettingsButton event={event} members={clubMembers} />
            <EventPublishButton event={event} template={{ subject: renderedSubject, body: renderedBody }} />
            <DeleteEventButton eventId={event.id} />
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

      {event.description && (
        <div className="rounded-xl border border-slate-100 bg-white p-4 sm:p-5">
          <p className="text-sm text-ink-soft whitespace-pre-line max-w-3xl">{event.description}</p>
        </div>
      )}

      <EventReadiness event={event} />

      <EventDashboard event={event as any} accounts={accounts} />
    </div>
  );
}
