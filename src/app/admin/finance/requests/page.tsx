import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import { Receipt } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";
import RequestActions from "./_components/RequestActions";
import RequestCreateDialog from "./_components/RequestCreateDialog";

export default async function PaymentRequestsPage() {
  const session = await getSession();
  if (!session || !session.roles) redirect("/auth/login");

  const canView = session.roles.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER"].includes(r));
  if (!canView) {
    return (
      <div className="p-20 text-center text-slate-500">
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p>You do not have permission to view the Finance module.</p>
      </div>
    );
  }

  const club = await getOrCreateDefaultClub();

  const [requests, totalMembers] = await Promise.all([
    prisma.paymentRequest.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      include: {
        assignees: { include: { member: { select: { id: true, name: true, email: true } } } },
        transactions: { select: { id: true, status: true, amount: true } },
      },
    }),
    prisma.member.count({ where: { clubId: club.id, isActive: true } }),
  ]);

  const rows = requests.map((req) => {
    const paidCount = req.transactions.filter(t => t.status === "APPROVED").length;
    const audienceCount = req.isGlobal ? totalMembers : req.assignees.length;
    return {
      id: req.id,
      title: req.title,
      category: req.category,
      isGlobal: req.isGlobal,
      amount: Number(req.amount),
      paidCount,
      audienceCount,
      dismissedCount: req.dismissedBy.length,
      dueDate: req.dueDate ? new Date(req.dueDate).toLocaleDateString() : null,
      actionsPayload: {
        id: req.id,
        title: req.title,
        description: req.description,
        amount: Number(req.amount),
        category: req.category,
        isGlobal: req.isGlobal,
        dueDate: req.dueDate ? req.dueDate.toISOString() : null,
      },
    };
  });

  return (
    <div className="max-w-6xl mx-auto py-6">
      <PageHeader
        title="Payment Requests"
        description="Invoices raised against members or the whole club."
        backHref="/admin/finance"
        backLabel="Back to Finance"
        actions={<RequestCreateDialog />}
      />

      {rows.length > 0 ? (
        <TableWrap
          mobile={rows.map((row) => (
            <div key={row.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900">{row.title}</div>
                  <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wide">{row.category.replace(/_/g, " ")}</Badge>
                </div>
                <div className="font-bold text-slate-900 whitespace-nowrap">₹{row.amount.toLocaleString()}</div>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                <span>{row.isGlobal ? "All Members" : `${row.audienceCount} member${row.audienceCount === 1 ? "" : "s"}`}</span>
                <span>
                  Paid: <span className="text-emerald-700 font-semibold">{row.paidCount}</span> / {row.audienceCount || "—"}
                </span>
                <span>Dismissed: {row.dismissedCount}</span>
                {row.dueDate && <span>Due: {row.dueDate}</span>}
              </div>
              <div className="flex justify-end pt-1 border-t border-slate-100">
                <RequestActions request={row.actionsPayload} />
              </div>
            </div>
          ))}
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Request</th>
                <th className="px-6 py-4 font-semibold">Audience</th>
                <th className="px-6 py-4 font-semibold">Amount</th>
                <th className="px-6 py-4 font-semibold">Paid</th>
                <th className="px-6 py-4 font-semibold">Dismissed</th>
                <th className="px-6 py-4 font-semibold">Due Date</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{row.title}</div>
                    <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wide">{row.category.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {row.isGlobal ? "All Members" : `${row.audienceCount} member${row.audienceCount === 1 ? "" : "s"}`}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">₹{row.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="text-emerald-700 font-semibold">{row.paidCount}</span>
                    <span className="text-slate-400"> / {row.audienceCount || "—"}</span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">{row.dismissedCount}</td>
                  <td className="px-6 py-4 text-slate-500 whitespace-nowrap">{row.dueDate || "—"}</td>
                  <td className="px-6 py-4 text-right">
                    <RequestActions request={row.actionsPayload} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <PortalEmptyState
            title="No payment requests yet"
            detail="Raise a request to invoice members for dues, event fees, or donations."
            action={<RequestCreateDialog triggerLabel="Raise Payment Request" triggerVariant="outline" />}
          />
        </div>
      )}
    </div>
  );
}
