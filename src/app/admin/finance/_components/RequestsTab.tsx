"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Users, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import FilterBar from "@/components/admin/FilterBar";
import { useQueryClient } from "@tanstack/react-query";
import { useLoadingToast } from "@/hooks/useLoadingToast";
import DeleteButton from "@/components/admin/DeleteButton";
import RequestEditDialog from "./RequestEditDialog";

export default function RequestsTab() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  
  const [editingRequest, setEditingRequest] = useState<any | null>(null);

  const invalidateData = () => {
    queryClient.invalidateQueries({ queryKey: ['admin-finance-requests'] });
  };

  const { data: requests = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['admin-finance-requests'],
    queryFn: async () => {
      const res = await fetch("/api/admin/finance/requests");
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    }
  });

  useLoadingToast(loading, "Loading requests...");

  const filteredRequests = requests.filter((req: any) => {
    if (!search) return true;
    const s = search.toLowerCase();
    return req.description?.toLowerCase().includes(s) || req.title?.toLowerCase().includes(s);
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const handleUpdateStatus = async (id: string, status: string) => {
    setIsUpdating(true);
    try {
      toast.success(`Request ${status}`);
      invalidateData();
    } catch (e) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Active Payment Requests</h2>
        <Link
          href="/admin/finance/requests/new"
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          Raise Request
        </Link>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Payment Requests</h2>
        <FilterBar 
          placeholder="Search requests..." 
          showMonthFilter 
        />
        
        {loading ? (
          <div className="text-sm text-gray-500 py-10">Loading requests...</div>
        ) : filteredRequests.length === 0 ? (
          <div className="text-slate-500 font-medium bg-white/40 backdrop-blur-md p-10 rounded-3xl text-center border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            No payment requests found matching criteria.
          </div>
        ) : (
          <div className="rounded-3xl border border-white/60 bg-white/40 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden transition-all hover:bg-white/60">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Date</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Requested By</th>
                    <th className="px-8 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Description</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Amount</th>
                    <th className="px-8 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-900/5">
                  {filteredRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-white/50 transition-colors group cursor-default">
                      <td className="px-8 py-5 whitespace-nowrap text-sm text-slate-500 font-medium">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{req.user?.name || "System"}</div>
                        <div className="text-xs text-slate-500 font-medium mt-1">{req.user?.email || "Admin"}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-medium text-slate-800">{req.description || req.title}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${req.type === 'INCOME' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-rose-100 text-rose-700 border-rose-200'}`}>
                            {req.type || "REQUEST"}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right font-black text-slate-900">
                        ₹{req.amount.toLocaleString()}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium space-x-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleUpdateStatus(req.id, "APPROVED")}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                          title="Approve"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(req.id, "REJECTED")}
                          disabled={isUpdating}
                          className="inline-flex items-center justify-center p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                          title="Reject"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editingRequest && (
        <RequestEditDialog
          request={editingRequest}
          onClose={() => setEditingRequest(null)}
          onSave={invalidateData}
        />
      )}
    </div>
  );
}
