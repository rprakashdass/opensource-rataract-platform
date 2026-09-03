import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { getSession } from "@/lib/auth/session";
import { redirect, notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";
import RequestActions from "../_components/RequestActions";
import { formatIST } from "@/lib/date-utils";

export default async function PaymentRequestDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
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

  const request = await prisma.paymentRequest.findUnique({
    where: { id },
    include: {
      assignees: { include: { member: { select: { id: true, name: true, email: true } } } },
      transactions: {
        where: { status: "APPROVED" },
        select: { id: true, memberId: true, amount: true, date: true, receiptNumber: true, receiptDocUrl: true },
      },
    },
  });
  if (!request || request.clubId !== club.id) notFound();

  const [allMembers, accounts] = await Promise.all([
    prisma.member.findMany({
      where: { clubId: club.id, ...(request.isGlobal ? { isActive: true } : {}) },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    }),
    prisma.account.findMany({ where: { clubId: club.id }, orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);

  const audience = request.isGlobal
    ? allMembers
    : request.assignees.map((a) => a.member);

  const paidByMemberId = new Map(request.transactions.map((t) => [t.memberId, t]));

  const actionsPayload = {
    id: request.id,
    title: request.title,
    description: request.description,
    amount: Number(request.amount),
    category: request.category,
    isGlobal: request.isGlobal,
    dueDate: request.dueDate ? request.dueDate.toISOString() : null,
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <PageHeader
        title={request.title}
        description="Payment request details and audience."
        backHref="/admin/finance/requests"
        backLabel="Back to Requests"
        actions={<RequestActions request={actionsPayload} members={allMembers} accounts={accounts} />}
      />

      <div className="rounded-2xl border border-slate-200 bg-white p-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</p>
          <p className="text-lg font-bold text-slate-900 mt-1">₹{Number(request.amount).toLocaleString("en-IN")}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Category</p>
          <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wide">{request.category.replace(/_/g, " ")}</Badge>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Due Date</p>
          <p className="text-sm font-medium text-slate-700 mt-1">{request.dueDate ? formatIST(request.dueDate, "MMM d, yyyy") : "—"}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Dismissed</p>
          <p className="text-sm font-medium text-slate-700 mt-1">{request.dismissedBy.length}</p>
        </div>
        {request.description && (
          <div className="col-span-2 sm:col-span-4 pt-2 border-t border-slate-100">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-sm text-slate-600 leading-relaxed">{request.description}</p>
          </div>
        )}
      </div>

      {audience.length > 0 ? (
        <TableWrap
          mobile={audience.map((m) => {
            const paid = paidByMemberId.get(m.id);
            return (
              <div key={m.id} className="p-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-semibold text-slate-900 truncate">{m.name || "Unnamed"}</div>
                  <div className="text-xs text-slate-500 truncate">{m.email || "—"}</div>
                </div>
                {paid ? (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                    Paid ₹{Number(paid.amount).toLocaleString("en-IN")}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full whitespace-nowrap">Pending</span>
                )}
              </div>
            );
          })}
        >
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-100 text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Paid On</th>
                <th className="px-6 py-4 font-semibold">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {audience.map((m) => {
                const paid = paidByMemberId.get(m.id);
                return (
                  <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{m.name || "Unnamed"}</div>
                      <div className="text-xs text-slate-500">{m.email || "—"}</div>
                    </td>
                    <td className="px-6 py-4">
                      {paid ? (
                        <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                          Paid ₹{Number(paid.amount).toLocaleString("en-IN")}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{paid ? formatIST(paid.date, "MMM d, yyyy") : "—"}</td>
                    <td className="px-6 py-4">
                      {paid?.receiptDocUrl ? (
                        <a href={paid.receiptDocUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-semibold text-brand hover:underline">
                          {paid.receiptNumber || "View"}
                        </a>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </TableWrap>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white">
          <PortalEmptyState title="No audience assigned" detail="This request isn't targeted at anyone yet." />
        </div>
      )}
    </div>
  );
}
