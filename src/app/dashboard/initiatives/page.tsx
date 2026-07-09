import Link from "next/link";
import { redirect } from "next/navigation";
import { getVisibleInitiatives } from "@/features/initiatives/queries/getInitiatives";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants";
import { Plus, Lightbulb, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

export default async function InitiativesPage({ searchParams }: { searchParams: Promise<{ mine?: string }> }) {
  const { mine } = await searchParams;
  const mineOnly = mine === "1";

  const result = await getVisibleInitiatives({ mineOnly });
  if ("error" in result && result.error) redirect(ROUTES.LOGIN);

  const { initiatives, currentMemberId } = result as any;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Initiatives</h1>
          <p className="text-slate-500 mt-1">Browse and suggest event or project ideas for the club.</p>
        </div>
        <Link href={`${ROUTES.DASHBOARD}/initiatives/new`}>
          <Button className="rounded-xl bg-purple-600 hover:bg-purple-700">
            <Plus className="w-4 h-4 mr-2" /> New Proposal
          </Button>
        </Link>
      </div>

      <div className="flex gap-2">
        <Link href={`${ROUTES.DASHBOARD}/initiatives`} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors", !mineOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}>
          All Proposals
        </Link>
        <Link href={`${ROUTES.DASHBOARD}/initiatives?mine=1`} className={cn("px-4 py-2 rounded-xl text-sm font-semibold transition-colors", mineOnly ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50")}>
          My Proposals
        </Link>
      </div>

      {initiatives.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 border-dashed">
          <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900">{mineOnly ? "You haven't proposed anything yet" : "No proposals yet"}</h3>
          <p className="text-slate-500 mt-1 mb-4">Got an idea for an event or project? Suggest it to the club.</p>
          <Link href={`${ROUTES.DASHBOARD}/initiatives/new`}>
            <Button variant="outline">Create a proposal</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {initiatives.map((initiative: any) => (
            <Link key={initiative.id} href={`${ROUTES.DASHBOARD}/initiatives/${initiative.id}`}>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <h3 className="font-bold text-slate-900">{initiative.title}</h3>
                    <InitiativeStatusBadge status={initiative.status} />
                    {initiative.proposedById === currentMemberId && (
                      <span className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">You</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 line-clamp-1">{initiative.description}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    By {initiative.proposedBy?.name || "Unknown"}
                    {initiative.portfolio?.name ? ` · ${initiative.portfolio.name}` : ""}
                    {" · "}Updated {formatDistanceToNow(new Date(initiative.updatedAt), { addSuffix: true })}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
