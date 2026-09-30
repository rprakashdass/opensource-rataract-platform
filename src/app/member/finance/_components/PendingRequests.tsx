"use client";
import React from "react";
import { ArrowRight, Clock, X, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function PendingRequests({ requests }: { requests: any[] }) {
  const router = useRouter();

  const handleDismiss = async (id: string) => {
    const toastId = toast.loading("Dismissing request...");
    try {
      const res = await fetch(`/api/finance/requests/${id}/dismiss`, {
        method: "POST"
      });
      if (!res.ok) throw new Error("Failed to dismiss");
      
      toast.success("Request dismissed", { id: toastId });
      router.refresh();
    } catch (error: any) {
      toast.error(error.message, { id: toastId });
    }
  };
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requests.map(req => {
        // A closed request is still shown — a member who never paid should see
        // why it stopped asking — but it carries no Pay/Ignore affordance.
        const isClosed = !!req.closedAt;
        return (
          <div key={req.id} className={`rounded-xl p-4 shadow-sm flex flex-col justify-between border ${isClosed ? "bg-slate-50 border-slate-200" : "bg-white border-amber-100"}`}>
            <div>
              <div className="flex justify-between items-start gap-2 mb-2">
                <h3 className={`font-bold ${isClosed ? "text-slate-600" : "text-slate-900"}`}>{req.title}</h3>
                <div className={`font-bold px-2 py-1 rounded text-sm whitespace-nowrap ${isClosed ? "bg-slate-200 text-slate-600" : "bg-amber-100 text-amber-800"}`}>
                  ₹{Number(req.amount).toLocaleString("en-IN")}
                </div>
              </div>
              {req.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{req.description}</p>
              )}
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2 mt-2 pt-3 border-t border-slate-100">
              {isClosed ? (
                <div className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                  <Lock className="h-3.5 w-3.5" />
                  Closed {new Date(req.closedAt).toLocaleDateString()} — no longer collecting
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-amber-700 font-medium">
                  <Clock className="h-3.5 w-3.5" />
                  {req.dueDate ? `Due ${new Date(req.dueDate).toLocaleDateString()}` : "Due Now"}
                </div>
              )}
              <div className="flex items-center gap-2">
                {isClosed ? (
                  <Link
                    href={`/member/finance/requests/${req.id}`}
                    className="text-xs text-slate-500 hover:text-slate-700 font-semibold py-1.5 px-2 rounded-lg transition flex items-center gap-1"
                  >
                    View <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <>
                    <button
                      onClick={() => handleDismiss(req.id)}
                      className="text-xs text-slate-500 hover:text-slate-700 font-medium py-1.5 px-2 rounded-lg transition flex items-center gap-1"
                    >
                      <X className="h-3 w-3" /> Ignore
                    </button>
                    <Link
                      href={`/member/finance/requests/${req.id}`}
                      className="text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-1.5 px-3 rounded-lg flex items-center gap-1 transition"
                    >
                      Pay Now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
