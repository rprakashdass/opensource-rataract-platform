import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Banknote, Receipt, AlertCircle, ArrowRight, ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import PendingRequests from "./_components/PendingRequests";
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
  });

  const member = await prisma.member.findUnique({
    where: { userId: session.id }
  });

  const club = await getOrCreateDefaultClub();

  let pendingRequests: any[] = [];
  if (member) {
    const allRequests = await prisma.paymentRequest.findMany({
      where: {
        clubId: club.id,
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
      !req.transactions.some((t: any) => t.status === "APPROVED" || t.status === "COMPLETED")
    );
  }

  const totalPaid = transactions
    .filter(t => t.type === "INCOME" && (t.status === "COMPLETED" || t.status === "APPROVED"))
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalPending = pendingRequests.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
            Finance & Dues
          </h1>
          <p className="text-base text-gray-500 max-w-2xl">
            Track your payment history and submit proof of payment seamlessly.
          </p>
        </div>
        <Link 
          href="/dashboard/finance/submit"
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-xl shadow-sm transition flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Submit Payment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-purple-900/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-emerald-600">
            <Banknote className="h-6 w-6" />
            <h3 className="font-semibold text-gray-700">Total Contributed</h3>
          </div>
          <p className="text-4xl font-black text-gray-900">₹{totalPaid.toLocaleString()}</p>
        </div>
        
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-purple-900/5 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-3 mb-4 text-amber-600">
            <AlertCircle className="h-6 w-6" />
            <h3 className="font-semibold text-gray-700">Total Pending Dues</h3>
          </div>
          <p className="text-4xl font-black text-gray-900">₹{totalPending.toLocaleString()}</p>
        </div>
      </div>

      {pendingRequests.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-amber-800">
            <AlertCircle className="h-6 w-6" />
            <h2 className="font-bold text-lg">Action Required: Pending Payments</h2>
          </div>
          <PendingRequests requests={pendingRequests} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden flex flex-col h-full">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg text-gray-600">
              <Banknote className="h-5 w-5" />
            </div>
            <h2 className="font-bold text-gray-900">Your Payment History</h2>
          </div>
          <div className="p-0 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">
                No payment records found.
              </div>
            ) : (
                <ul className="divide-y divide-gray-100">
                  {transactions.map((tx) => (
                    <li key={tx.id} className="p-4 hover:bg-gray-50 transition">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tx.description}</p>
                          <p className="text-xs text-gray-500">{new Date(tx.createdAt).toLocaleDateString()} • {tx.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-emerald-700">₹{tx.amount.toLocaleString()}</p>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mt-1
                            ${tx.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' : 
                              tx.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
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
