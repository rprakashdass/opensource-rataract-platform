import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { getInitiativeForMember } from "@/features/initiatives/queries/getInitiatives";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { PageHeader } from "@/components/portal";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import { CommentThread } from "@/components/initiatives/CommentThread";
import InitiativeForm from "../_components/InitiativeForm";

export default async function InitiativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect(ROUTES.LOGIN);

  const result = await getInitiativeForMember(id);
  if ("error" in result && result.error) notFound();

  const { initiative, isOwner } = result as any;
  const editable = isOwner && ["DRAFT", "NEEDS_CHANGES"].includes(initiative.status);
  const isAdmin = session.roles?.includes("SUPER_ADMIN") || session.roles?.includes("CLUB_ADMIN");
  const canComment = isOwner || isAdmin;

  const club = await getCurrentClub();
  const portfolios = club
    ? await prisma.portfolio.findMany({
        where: { clubId: club.id, isActive: true },
        orderBy: { displayOrder: "asc" },
        select: { id: true, name: true },
      })
    : [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title={initiative.title}
        description={`By ${initiative.proposedBy?.name || "Unknown"}${isOwner ? " (you)" : ""}${editable ? " · You can edit and resubmit this idea." : ""}`}
        backHref={`${ROUTES.DASHBOARD}/initiatives`}
        backLabel="Back to Ideas"
        actions={<InitiativeStatusBadge status={initiative.status} />}
      />

      {editable ? (
        <InitiativeForm initiative={initiative} portfolios={portfolios} />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">Description</p>
            <p className="text-slate-700 whitespace-pre-wrap">{initiative.description}</p>
          </div>
          {initiative.problemStatement && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Problem Statement</p>
              <p className="text-slate-700 whitespace-pre-wrap">{initiative.problemStatement}</p>
            </div>
          )}
          {initiative.expectedImpact && (
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Expected Impact</p>
              <p className="text-slate-700 whitespace-pre-wrap">{initiative.expectedImpact}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {initiative.portfolio?.name && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Portfolio</p>
                <p className="text-slate-700">{initiative.portfolio.name}</p>
              </div>
            )}
            {initiative.estimatedBudget && (
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase mb-1">Estimated Budget</p>
                <p className="text-slate-700">₹{Number(initiative.estimatedBudget).toLocaleString()}</p>
              </div>
            )}
          </div>
          {initiative.status === "CONVERTED" && (initiative.convertedEvent || initiative.convertedProject) && (
            <div className="p-4 bg-pink-50 border border-pink-100 rounded-xl">
              <p className="text-sm font-bold text-brand-deep">
                🎉 {isOwner ? "Your" : "This"} idea became {initiative.convertedEvent ? "an event" : "a project"}: {initiative.convertedEvent?.title || initiative.convertedProject?.title}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <CommentThread initiativeId={initiative.id} comments={initiative.comments} currentUserId={session.id} canComment={canComment} />
      </div>
    </div>
  );
}
