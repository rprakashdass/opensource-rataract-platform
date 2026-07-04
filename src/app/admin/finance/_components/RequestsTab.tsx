"use client";

import React, { useState, useEffect } from "react";
import { Plus, Users, Globe, Clock, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useLoadingToast } from "@/hooks/useLoadingToast";

export default function RequestsTab() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useLoadingToast(loading, "Loading requests...");

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/finance/requests");
      const data = await res.json();
      if (!data.error) setRequests(data);
    } catch (err) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

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
      
      {loading ? (
        <div className="text-sm text-gray-500 py-10">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
          No active payment requests. Raise a request to start collecting payments.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg">{req.title}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{req.description || "No description"}</p>
                </div>
                <div className="bg-purple-50 text-purple-700 font-bold px-2 py-1 rounded text-sm whitespace-nowrap">
                  ₹{req.amount}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-gray-50 p-2 rounded-lg mb-4">
                {req.isGlobal ? (
                  <><Globe className="h-3.5 w-3.5 text-blue-500" /> Global (All Members)</>
                ) : (
                  <><Users className="h-3.5 w-3.5 text-amber-500" /> Specific ({req.assignees.length} Members)</>
                )}
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {req.dueDate ? new Date(req.dueDate).toLocaleDateString() : "No due date"}
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <CheckCircle className="h-3 w-3" />
                  {req.transactions?.filter((t: any) => t.status === "APPROVED" || t.status === "COMPLETED").length} Paid
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
