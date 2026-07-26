import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { PageHeader } from "@/components/portal";
import EventDashboard from "@/app/admin/events/[id]/_components/EventDashboard";
import EventSettingsButton from "@/app/admin/events/[id]/_components/EventSettingsButton";
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
      transactions: { select: { id: true, title: true, amount: true, type: true, status: true } },
      media: { orderBy: { createdAt: "desc" } },
      initiative: { select: { id: true, proposedBy: { select: { name: true, avatar: true } } } },
    },
  });

  if (!event) notFound();

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-6">
      <PageHeader
        title={event.title}
        description={event.description || undefined}
        backHref="/member/events"
        backLabel="Back to Events"
        actions={
          <>
            <EventSettingsButton event={event} />
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

      <EventDashboard event={event as any} chairMode />
    </div>
  );
}
