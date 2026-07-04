import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ROUTES } from "@/lib/constants";
import { ArrowLeft, ArrowUpRight, ArrowDownRight, Search } from "lucide-react";

export default async function TreasuryTransactions() {
  const transactions = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true } },
      member: { select: { name: true } },
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <Link href={`${ROUTES.ADMIN}/finance`} className="text-emerald-600 hover:underline text-sm font-semibold flex items-center gap-1 mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Transaction Ledger</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            A comprehensive history of all club incomes and expenses.
          </p>
        </div>
        <Link href={`${ROUTES.ADMIN}/finance/transactions/new`} className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition">
          Log Transaction
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search transactions..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{tx.description}</div>
                      <div className="text-xs text-gray-500">{tx.category} • {tx.user?.name || "System"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.type === "INCOME" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <ArrowUpRight className="h-3 w-3" /> Income
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <ArrowDownRight className="h-3 w-3" /> Expense
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {tx.type === "INCOME" ? "+" : "-"}₹{tx.amount.toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${tx.status === 'APPROVED' || tx.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : 
                          tx.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
