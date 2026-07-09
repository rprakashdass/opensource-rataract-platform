import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600 hover:bg-slate-100",
  SUBMITTED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  UNDER_REVIEW: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  NEEDS_CHANGES: "bg-orange-100 text-orange-700 hover:bg-orange-100",
  APPROVED: "bg-green-100 text-green-700 hover:bg-green-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
  CONVERTED: "bg-purple-100 text-purple-700 hover:bg-purple-100",
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Draft",
  SUBMITTED: "Submitted",
  UNDER_REVIEW: "Under Review",
  NEEDS_CHANGES: "Needs Changes",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  CONVERTED: "Converted",
};

export function InitiativeStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={`border-transparent font-semibold ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"} ${className || ""}`}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
