import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RequestActions from "./_components/RequestActions";

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

  return (
    <div className="max-w-6xl mx-auto space-y-6 py-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance" className="p-2 hover:bg-gray-100 rounded-full transition">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-gray-900">Payment Requests</h1>
            <p className="text-sm text-gray-500 mt-1">Invoices raised against members or the whole club.</p>
          </div>
        </div>
        <Link href="/admin/finance/requests/new">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white gap-1.5">
            <Plus className="w-4 h-4" /> New Request
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {requests.length > 0 ? (
          <div className="overflow-x-auto">
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
                {requests.map((req) => {
                  const paidCount = req.transactions.filter(t => t.status === "APPROVED").length;
                  const audienceCount = req.isGlobal ? totalMembers : req.assignees.length;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900">{req.title}</div>
                        <Badge variant="secondary" className="mt-1 text-[10px] uppercase tracking-wide">{req.category.replace(/_/g, " ")}</Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {req.isGlobal ? "All Members" : `${audienceCount} member${audienceCount === 1 ? "" : "s"}`}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">₹{Number(req.amount).toLocaleString()}</td>
                      <td className="px-6 py-4">
                        <span className="text-green-700 font-semibold">{paidCount}</span>
                        <span className="text-slate-400"> / {audienceCount || "—"}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">{req.dismissedBy.length}</td>
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <RequestActions requestId={req.id} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-16 text-center text-slate-500">
            <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900">No payment requests yet</h3>
            <p className="text-slate-500 mt-1 mb-4">Raise a request to invoice members for dues, event fees, or donations.</p>
            <Link href="/admin/finance/requests/new">
              <Button variant="outline">Raise Payment Request</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
