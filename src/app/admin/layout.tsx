"use client";

import AdminSidebar, { AdminNavItems } from "@/components/layout/AdminSidebar";
import LogoutButton from "@/components/auth/LogoutButton";
import { useState } from "react";
import { Menu, X } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 relative selection:bg-slate-200 selection:text-slate-900">
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white/70 backdrop-blur-xl border-b border-white/40 sticky top-0 z-40 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open admin menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
              Rotaract Admin
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 items-center">
            <div className="w-px h-8 bg-gray-200 hidden md:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
              <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Admin Panel
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <AdminNavItems onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex max-w-[1600px] mx-auto w-full">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-x-hidden animate-in fade-in duration-700 slide-in-from-bottom-4">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}
