import { Badge } from "@/components/ui/badge";

const STATUS_STYLES: Record<string, string> = {
  PENDING_APPROVAL: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  APPROVED: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  REJECTED: "bg-red-100 text-red-700 hover:bg-red-100",
  SENT: "bg-green-100 text-green-700 hover:bg-green-100",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_APPROVAL: "Pending Approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  SENT: "Sent",
};

export function MailStatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <Badge variant="outline" className={`border-transparent font-semibold ${STATUS_STYLES[status] || "bg-slate-100 text-slate-600"} ${className || ""}`}>
      {STATUS_LABELS[status] || status}
    </Badge>
  );
}
