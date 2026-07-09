import Link from "next/link";
import { getClubInitiatives } from "@/features/initiatives/queries/getInitiatives";
import { InitiativeStatusBadge } from "@/components/initiatives/InitiativeStatusBadge";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { Lightbulb } from "lucide-react";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Initiative Proposals</h1>
        <p className="text-slate-500 mt-1">Review member-suggested event and project ideas.</p>
      </div>

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

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {initiatives.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {initiatives.map((initiative: any) => (
              <Link key={initiative.id} href={`${ROUTES.ADMIN}/proposals/${initiative.id}`}>
                <div className="p-5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900">{initiative.title}</h3>
                      <InitiativeStatusBadge status={initiative.status} />
                    </div>
                    <p className="text-sm text-slate-500 line-clamp-1">{initiative.description}</p>
                    <p className="text-xs text-slate-400 mt-2">
                      Proposed by {initiative.proposedBy?.name || "Unknown"}
                      {initiative.portfolio?.name ? ` · ${initiative.portfolio.name}` : ""}
                      {" · "}{formatDistanceToNow(new Date(initiative.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            No proposals in this category yet.
          </div>
        )}
      </div>
    </div>
  );
}
