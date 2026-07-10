"use client";

import { useState } from "react";
import { PortalHeader, NotificationItem } from "@/components/layout/PortalHeader";
import { PortalSidebar, NavGroup } from "@/components/layout/PortalSidebar";
import { ROUTES } from "@/lib/constants";
import { 
  LayoutDashboard, Users, Calendar, Image as ImageIcon, Settings, 
  Banknote, Bell, Briefcase, ClipboardCheck, Globe, ArrowLeftRight, 
  PieChart, FileSpreadsheet, Lightbulb, UserCircle, Mail
} from "lucide-react";

interface AdminLayoutClientProps {
  children: React.ReactNode;
  club: { name: string; logoUrl?: string | null; tenureYear: string; };
  user: { name: string; email: string; roles: string[]; };
  notifications: NotificationItem[];
  attentionSummary: {
    memberships: { count: number; href: string };
    ideas: { count: number; href: string };
    finance: { count: number; href: string };
    media: { count: number; href: string };
  };
}

export default function AdminLayoutClient({ children, club, user, notifications, attentionSummary }: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavGroups: NavGroup[] = [
    {
      items: [
        { label: "Overview", href: ROUTES.ADMIN, icon: LayoutDashboard }
      ]
    },
    {
      group: "Club Operations",
      items: [
        { label: "Members", href: `${ROUTES.ADMIN}/members`, icon: Users, badgeCount: attentionSummary.memberships.count },
        { label: "Board", href: `${ROUTES.ADMIN}/settings/roles`, icon: UserCircle }, // Assuming settings/roles is the closest
        { label: "Projects", href: `${ROUTES.ADMIN}/projects`, icon: Briefcase },
        { label: "Events", href: `${ROUTES.ADMIN}/events`, icon: Calendar },
        { label: "Ideas", href: `${ROUTES.ADMIN}/proposals`, icon: Lightbulb, badgeCount: attentionSummary.ideas.count },
        { label: "Attendance", href: `${ROUTES.ADMIN}/attendance`, icon: ClipboardCheck },
      ]
    },
    {
      group: "Website",
      items: [
        { label: "Pages", href: `${ROUTES.ADMIN}/website`, icon: Globe },
        { label: "Gallery", href: `${ROUTES.ADMIN}/gallery`, icon: ImageIcon },
        { label: "Inquiries", href: `${ROUTES.ADMIN}/inquiries`, icon: Bell }, // Or wherever inquiries live
      ]
    },
    {
      group: "Communication",
      items: [
        { label: "Announcements", href: `${ROUTES.ADMIN}/announcements`, icon: Bell },
        { label: "Email Templates", href: `${ROUTES.ADMIN}/communications`, icon: Mail },
      ]
    },
    {
      group: "Finance",
      items: [
        { label: "Overview", href: `${ROUTES.ADMIN}/finance`, icon: Banknote },
        { label: "Transactions", href: `${ROUTES.ADMIN}/finance/transactions`, icon: ArrowLeftRight, badgeCount: attentionSummary.finance.count },
        { label: "Budgets", href: `${ROUTES.ADMIN}/finance/budgets`, icon: PieChart },
        { label: "Reports", href: `${ROUTES.ADMIN}/finance/reports`, icon: FileSpreadsheet },
      ]
    },
    {
      group: "Settings",
      items: [
        { label: "Club Settings", href: `${ROUTES.ADMIN}/settings`, icon: Settings },
        { label: "Access Management", href: `${ROUTES.ADMIN}/accounts`, icon: UserCircle },
      ]
    }
  ];

  return (
    <div className="h-screen overflow-hidden bg-slate-50 text-slate-900 relative selection:bg-slate-200 selection:text-slate-900 flex flex-col">
      <PortalHeader 
        club={club}
        user={user}
        notifications={notifications}
        onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
        isAdminContext={true}
      />

      <div className="flex max-w-[1600px] mx-auto w-full flex-1 overflow-hidden">
        <PortalSidebar 
          navGroups={adminNavGroups}
          isMobileOpen={mobileMenuOpen}
          onMobileClose={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 overflow-y-auto overflow-x-hidden animate-in fade-in duration-700 slide-in-from-bottom-4">
          {children}
        </main>
      </div>
    </div>
  );
}
