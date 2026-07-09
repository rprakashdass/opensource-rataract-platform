import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { getInitiativeForMember } from "@/features/initiatives/queries/getInitiatives";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ROUTES } from "@/lib/constants";
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
      <div className="flex items-center gap-4">
        <Link href={`${ROUTES.DASHBOARD}/initiatives`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{initiative.title}</h1>
            <InitiativeStatusBadge status={initiative.status} />
          </div>
          <p className="text-slate-500 mt-1 text-sm">
            By {initiative.proposedBy?.name || "Unknown"}
            {isOwner ? " (you)" : ""}
            {editable ? " · You can edit and resubmit this proposal." : ""}
          </p>
        </div>
      </div>

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
          <div className="grid grid-cols-2 gap-4">
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
            <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
              <p className="text-sm font-bold text-purple-700">
                🎉 {isOwner ? "Your" : "This"} proposal became {initiative.convertedEvent ? "an event" : "a project"}: {initiative.convertedEvent?.title || initiative.convertedProject?.title}
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
