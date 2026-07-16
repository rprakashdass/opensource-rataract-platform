import Link from "next/link";
import { getClubInitiatives } from "@/features/initiatives/queries/getInitiatives";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Lightbulb, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/portal";

const STATUS_TABS = [
  { value: "", label: "All" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "NEEDS_CHANGES", label: "Needs Changes" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CONVERTED", label: "Converted" },
  { value: "DRAFT", label: "Drafts" },
];

export default async function ProposalsAdminPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const result = await getClubInitiatives(status);
  const initiatives = (result as any).initiatives || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-2">
      <PageHeader
        title="Initiative Proposals"
        description="Review member-suggested event and project ideas."
      />

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value ? `${ROUTES.ADMIN}/proposals?status=${tab.value}` : `${ROUTES.ADMIN}/proposals`}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors",
              (status || "") === tab.value ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <div>
        {initiatives.length > 0 ? (
          <div className="space-y-4">
            {initiatives.map((initiative: any) => (
              <Link key={initiative.id} href={`${ROUTES.ADMIN}/proposals/${initiative.id}`} className="block group">
                <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300 flex items-center justify-between gap-6">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-brand transition-colors">{initiative.title}</h3>
                      <InitiativeStatusBadge status={initiative.status} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{initiative.description}</p>
                    <p className="text-xs text-slate-400 font-medium">
                      Proposed by {initiative.proposedBy?.name || "Unknown"}
                      {initiative.portfolio?.name ? ` · ${initiative.portfolio.name}` : ""}
                      {" · "}{formatDistanceToNow(new Date(initiative.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-brand transition-colors shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 p-16 text-center text-slate-500">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            No proposals in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
