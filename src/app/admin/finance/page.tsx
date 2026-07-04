"use client";

import React, { useState } from "react";
import { HandCoins } from "lucide-react";
import TreasuryTab from "./_components/TreasuryTab";
import RequestsTab from "./_components/RequestsTab";

export default function AdminFinancePage() {
  const [activeTab, setActiveTab] = useState<"treasury" | "requests">("treasury");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-3">
          <HandCoins className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-black text-gray-900">Finance & Treasury</h1>
            <p className="text-sm text-gray-500 mt-1">Manage club finances, approve transactions, and raise payment requests</p>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("treasury")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "treasury" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Treasury Report
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === "requests" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Payment Requests
          </button>
        </div>
      </div>

      <div className="pt-2">
        {activeTab === "treasury" ? <TreasuryTab /> : <RequestsTab />}
      </div>
    </div>
  );
}
