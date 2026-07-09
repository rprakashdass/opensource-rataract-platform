import Link from "next/link";
import { notFound } from "next/navigation";
import { getInitiativeForAdmin } from "@/features/initiatives/queries/getInitiatives";
import { getSession } from "@/lib/auth/session";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import { CommentThread } from "@/components/initiatives/CommentThread";
import { ReviewActions } from "../_components/ReviewActions";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, User, Layers, Wallet, CalendarClock } from "lucide-react";

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();

  const result = await getInitiativeForAdmin(id);
  if ("error" in result && result.error) notFound();
  const initiative = (result as any).initiative;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`${ROUTES.ADMIN}/proposals`} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{initiative.title}</h1>
            <InitiativeStatusBadge status={initiative.status} />
          </div>
          <p className="text-slate-500 mt-1 text-sm flex items-center gap-1">
            <User className="w-3.5 h-3.5" /> Proposed by {initiative.proposedBy?.name || "Unknown"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
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

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
          {initiative.portfolio?.name && (
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Portfolio</p>
                <p className="text-sm font-semibold text-slate-700">{initiative.portfolio.name}</p>
              </div>
            </div>
          )}
          {initiative.estimatedBudget && (
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Estimated Budget</p>
                <p className="text-sm font-semibold text-slate-700">₹{Number(initiative.estimatedBudget).toLocaleString()}</p>
              </div>
            </div>
          )}
          {initiative.preferredDate && (
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-slate-400" />
              <div>
                <p className="text-xs text-slate-400">Preferred Date</p>
                <p className="text-sm font-semibold text-slate-700">{new Date(initiative.preferredDate).toLocaleDateString()}</p>
              </div>
            </div>
          )}
        </div>

        {initiative.attachments?.length > 0 && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-2">Attachments</p>
            <div className="flex flex-wrap gap-2">
              {initiative.attachments.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noreferrer" className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200">
                  Attachment {i + 1}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-bold text-slate-700 uppercase mb-4">Review</h2>
        <ReviewActions initiativeId={initiative.id} status={initiative.status} />
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <CommentThread initiativeId={initiative.id} comments={initiative.comments} currentUserId={session?.id} />
      </div>
    </div>
  );
}
