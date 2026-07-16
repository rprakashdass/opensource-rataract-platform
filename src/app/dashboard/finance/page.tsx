import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Banknote, AlertCircle, Plus } from "lucide-react";
import Link from "next/link";
import PendingRequests from "./_components/PendingRequests";
import { PageHeader, StatCard, StatGrid } from "@/components/portal";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

import { redirect } from "next/navigation";

export default async function MemberFinancePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const transactions = await prisma.transaction.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "desc" },
    include: { category: true }
  });

  const member = await prisma.member.findUnique({
    where: { userId: session.id }
  });

  const club = await getOrCreateDefaultClub();

  let pendingRequests: any[] = [];
  if (member) {
    const allRequests = await prisma.paymentRequest.findMany({
      where: {
        clubId: member.clubId,
        OR: [
          { isGlobal: true },
          { assignees: { some: { memberId: member.id } } }
        ]
      },
      include: {
        transactions: {
          where: { userId: session.id }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Filter out requests that have an APPROVED transaction by this user
    // or requests that the user has explicitly dismissed
    pendingRequests = allRequests.filter(req => 
      !req.dismissedBy.includes(member.id) &&
      !req.transactions.some((t: any) => t.status === "APPROVED")
    );
  }

  const totalPaid = transactions
    .filter(t => t.type === "INCOME" && t.status === "APPROVED")
    .reduce((acc: number, curr) => acc + Number(curr.amount), 0);

  const totalPending = pendingRequests.reduce((acc: number, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Finance & Dues"
        description="Track your payment history and submit proof of payment seamlessly."
        actions={
          <Link
            href="/dashboard/finance/submit"
            className="bg-brand hover:bg-brand-deep text-white font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Submit Payment
          </Link>
        }
      />

      <StatGrid className="lg:grid-cols-2">
        <StatCard label="Total Contributed" value={`₹${totalPaid.toLocaleString()}`} icon={Banknote} tone="positive" />
        <StatCard label="Total Pending Dues" value={`₹${totalPending.toLocaleString()}`} icon={AlertCircle} tone="warning" />
      </StatGrid>

      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <AlertCircle className="h-5 w-5" />
            <h2 className="font-semibold text-base">Action Required: Pending Payments</h2>
          </div>
          <PendingRequests requests={pendingRequests} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden flex flex-col h-full">
          <div className="bg-slate-50 px-6 py-5 border-b border-slate-100 flex items-center gap-3">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
              <Banknote className="h-5 w-5" />
            </div>
            <h2 className="text-base font-semibold text-slate-900">Your Payment History</h2>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-slate-500">
                No payment records found.
              </div>
            ) : (
                <ul className="divide-y divide-slate-100">
                  {transactions.map((tx: any) => (
                    <li key={tx.id} className="p-4 hover:bg-slate-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                          <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleDateString()} • {tx.category?.name || "Other"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-700">₹{Number(tx.amount).toLocaleString()}</p>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1
                            ${tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                              tx.status === 'REJECTED' ? 'bg-rose-100 text-rose-700' :
                              'bg-amber-100 text-amber-700'}`}>
                            {tx.status}
                          </span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
    </div>
  );
}
