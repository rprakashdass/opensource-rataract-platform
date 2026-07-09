"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import LogoutButton from "@/components/auth/LogoutButton";
import { useState } from "react";
import { Menu, X, LayoutDashboard, UserCircle, Calendar, Banknote, Briefcase, ClipboardCheck, ShieldCheck, Lightbulb } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const BASE_NAV_ITEMS = [
  { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Events", href: `${ROUTES.DASHBOARD}/events`, icon: Calendar },
  { label: "Projects", href: `${ROUTES.DASHBOARD}/projects`, icon: Briefcase },
  { label: "Initiatives", href: `${ROUTES.DASHBOARD}/initiatives`, icon: Lightbulb },
  { label: "Attendance", href: `${ROUTES.DASHBOARD}/attendance`, icon: ClipboardCheck },
  { label: "Profile", href: `${ROUTES.DASHBOARD}/profile`, icon: UserCircle },
];

export default function DashboardLayoutClient({ children, roles }: { children: React.ReactNode, roles: string[] }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [...BASE_NAV_ITEMS];
  if (roles.includes("FINANCE_VIEWER")) {
    navItems.push({ label: "Finance Reports", href: `${ROUTES.DASHBOARD}/finance`, icon: Banknote });
  }
  const isAdmin = roles.some(r => ['SUPER_ADMIN', 'ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN', 'EVENTS_ADMIN', 'CONTENT_ADMIN'].includes(r));
  if (isAdmin) {
    navItems.push({ label: "Admin Portal", href: ROUTES.ADMIN, icon: ShieldCheck });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Header & Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6 border-r border-slate-100 pr-6">
              <div className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Rotaract
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex flex-1 items-center gap-1 px-6 overflow-x-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && item.href !== ROUTES.ADMIN && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all text-sm whitespace-nowrap",
                      isActive
                        ? "bg-purple-100/50 text-purple-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    )}
                  >
                    <Icon className={cn("h-4 w-4", isActive ? "text-purple-700" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex gap-4 items-center pl-6 border-l border-slate-100">
              <div className="hidden lg:block">
                <LogoutButton />
              </div>
              {/* Mobile hamburger */}
              <button
                className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition text-slate-600"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-2xl flex flex-col animate-in slide-in-from-right-full duration-200">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <span className="font-bold text-slate-800">Navigation</span>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 bg-white rounded-full shadow-sm">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== ROUTES.DASHBOARD && item.href !== ROUTES.ADMIN && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm",
                      isActive
                        ? "bg-purple-100 text-purple-700 shadow-sm"
                        : "text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", isActive ? "text-purple-700" : "text-slate-400")} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
        {children}
      </main>
    </div>
  );
}
