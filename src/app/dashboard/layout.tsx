"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import LogoutButton from "@/components/auth/LogoutButton";
import { useState } from "react";
import { Menu, X, LayoutDashboard, UserCircle, Calendar, Banknote } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Profile", href: `${ROUTES.DASHBOARD}/profile`, icon: UserCircle },
  { label: "Events", href: `${ROUTES.DASHBOARD}/events`, icon: Calendar },
  { label: "Finance & Dues", href: `${ROUTES.DASHBOARD}/finance`, icon: Banknote },
];

function DashboardSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1 p-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all text-sm",
              isActive
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className={cn("h-5 w-5", isActive ? "text-purple-700" : "text-gray-400")} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>
            <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Rotaract
            </div>
          </div>
          <div className="flex gap-3 sm:gap-6 items-center">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-900 leading-tight">Member Dashboard</span>
            </div>
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
                Dashboard
              </span>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close menu"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <DashboardSidebar onClose={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex max-w-7xl mx-auto w-full">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-56 lg:w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] flex-shrink-0">
          <DashboardSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
