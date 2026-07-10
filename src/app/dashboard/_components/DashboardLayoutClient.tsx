"use client";

import { useState } from "react";
import { PortalHeader, NotificationItem } from "@/components/layout/PortalHeader";
import { PortalSidebar, NavGroup } from "@/components/layout/PortalSidebar";
import { ROUTES } from "@/lib/constants";
import { LayoutDashboard, Calendar, Briefcase, Lightbulb, ClipboardCheck, UserCircle } from "lucide-react";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  roles: string[];
  club: { name: string; logoUrl?: string | null; tenureYear: string; };
  user: { name: string; email: string; roles: string[]; };
  notifications: NotificationItem[];
}

export default function DashboardLayoutClient({ children, roles, club, user, notifications }: DashboardLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const memberNavGroups: NavGroup[] = [
    {
      items: [
        { label: "Overview", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
        { label: "Events", href: `${ROUTES.DASHBOARD}/events`, icon: Calendar },
        { label: "Projects", href: `${ROUTES.DASHBOARD}/projects`, icon: Briefcase },
        { label: "Ideas", href: `${ROUTES.DASHBOARD}/initiatives`, icon: Lightbulb },
        { label: "My Contributions", href: `${ROUTES.DASHBOARD}/attendance`, icon: ClipboardCheck },
        { label: "Profile", href: `${ROUTES.DASHBOARD}/profile`, icon: UserCircle },
      ]
    }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 flex flex-col">
      <PortalHeader 
        club={club}
        user={user}
        notifications={notifications}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isAdminContext={false}
      />

      <div className="flex flex-1 overflow-hidden">
        <PortalSidebar 
          navGroups={memberNavGroups}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
