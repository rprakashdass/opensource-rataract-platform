import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { PageHeader } from "@/components/portal";
import { Button } from "@/components/ui/button";
import { ClipboardCheck, FileText } from "lucide-react";
import Link from "next/link";
import EventDashboard from "@/app/admin/events/[id]/_components/EventDashboard";
import EventSettingsButton from "@/app/admin/events/[id]/_components/EventSettingsButton";
import EventReadiness from "@/app/admin/events/[id]/_components/EventReadiness";
import SubmitForApprovalButton from "./SubmitForApprovalButton";

export const dynamic = "force-dynamic";

export default async function ChairEventManagePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session) redirect("/auth/login");

  // Resource-based guard: admins, or the chair/co-chair of THIS event only.
  if (!(await canManageEvent(session, params.id))) notFound();

  const event = await prisma.event.findUnique({
    where: { id: params.id },
    include: {
      club: true,
      project: { select: { title: true } },
      registrations: {
        orderBy: { registeredAt: "desc" },
        include: { member: { select: { name: true, email: true } } },
      },
      minutes: { select: { content: true } },
      attendance: { select: { id: true, memberId: true } },
      transactions: { select: { id: true, title: true, amount: true, type: true, status: true, receiptUrl: true } },
      budget: { select: { id: true, allocatedAmount: true } },
      media: { orderBy: { createdAt: "desc" } },
      members: { select: { memberId: true, role: true } },
      initiative: { select: { id: true, proposedBy: { select: { name: true, avatar: true } } } },
    },
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

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <PageHeader
        title={event.title}
        backHref="/member/events"
        backLabel="Back to Events"
        actions={
          <>
            <Link href={`/member/events/${event.id}/attendance`}>
              <Button variant="outline" className="gap-2"><ClipboardCheck className="w-4 h-4" /> Attendance</Button>
            </Link>
            <Link href={`/reports/events/${event.id}?source=member`} target="_blank">
              <Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Report</Button>
            </Link>
            <EventSettingsButton event={event} members={clubMembers} />
            {event.publishStatus === "DRAFT" && (
              <SubmitForApprovalButton
                eventId={event.id}
                alreadySubmitted={!!event.submittedForReviewAt}
              />
            )}
          </>
        }
        className="mb-0"
      />

      {event.publishStatus === "DRAFT" && (
        <div className="inline-flex items-center gap-2 text-sm bg-wash border border-hairline text-ink-soft px-4 py-2 rounded-xl">
          This event is a draft. Set it up here, then submit it for admin approval — only an admin can publish it live.
        </div>
      )}

      {event.description && (
        <div className="rounded-xl border border-slate-100 bg-white p-4 sm:p-5">
          <p className="text-sm text-ink-soft whitespace-pre-line max-w-3xl">{event.description}</p>
        </div>
      )}

      <EventReadiness event={event} />

      <EventDashboard event={event as any} accounts={accounts} chairMode />
    </div>
  );
}
