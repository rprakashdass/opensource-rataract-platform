"use client";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PendingApprovalsList({ initialTransactions }: { initialTransactions: any[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAction = async (id: string, status: "APPROVED" | "REJECTED") => {
    setLoadingId(id);
    const loadingToast = toast.loading(`Marking as ${status.toLowerCase()}...`);
    
    try {
      const res = await fetch("/api/admin/finance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      toast.success(`Transaction ${status.toLowerCase()} successfully`, { id: loadingToast });
      router.refresh();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setLoadingId(null);
    }
  };

  if (initialTransactions.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-gray-500">
        No pending transactions to review.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted By</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {initialTransactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{tx.user?.name || "Unknown"}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">{tx.description}</div>
                <div className="text-xs text-gray-500">{tx.category}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-semibold text-emerald-600">₹{tx.amount.toLocaleString()}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {tx.receiptUrl ? (
                  <a href={tx.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    View Proof
                  </a>
                ) : "No receipt"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  onClick={() => handleAction(tx.id, "APPROVED")}
                  disabled={loadingId === tx.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition disabled:opacity-50"
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </button>
                <button
                  onClick={() => handleAction(tx.id, "REJECTED")}
                  disabled={loadingId === tx.id}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                >
                  <XCircle className="h-4 w-4" /> Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
