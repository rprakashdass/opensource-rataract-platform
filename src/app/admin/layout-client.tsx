"use client";

import { useState } from "react";
import { PortalHeader, NotificationItem } from "@/components/layout/PortalHeader";
import { PortalSidebar, NavGroup } from "@/components/layout/PortalSidebar";
import { PageTransition } from "@/components/ui/motion/PageTransition";
import { ROUTES } from "@/lib/constants";
import { 
  LayoutDashboard, Users, Calendar, Image as ImageIcon, Settings, 
  Banknote, Bell, Briefcase, ClipboardCheck, Globe, ArrowLeftRight, 
  PieChart, FileSpreadsheet, Lightbulb, UserCircle, Mail, HandCoins, MessageSquareWarning, MessageSquarePlus
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
  permissions: {
    canViewFinance: boolean;
    canManageClub: boolean;
    canManageSystem: boolean;
    canManageWebsite: boolean;
    canManageCommunication: boolean;
  };
}

export default function AdminLayoutClient({ children, club, user, notifications, attentionSummary, permissions }: AdminLayoutClientProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavGroups: NavGroup[] = [];

  adminNavGroups.push({
    items: [
      { label: "Overview", href: ROUTES.ADMIN, icon: LayoutDashboard }
    ]
  });

  if (permissions.canManageClub) {
    adminNavGroups.push({
      group: "Club Operations",
      items: [
        { label: "Inbox", href: `${ROUTES.ADMIN}/mailbox`, icon: MessageSquareWarning },
        { label: "Members", href: `${ROUTES.ADMIN}/members`, icon: Users, badgeCount: attentionSummary.memberships.count },
        { label: "Projects", href: `${ROUTES.ADMIN}/projects`, icon: Briefcase },
        { label: "Events", href: `${ROUTES.ADMIN}/events`, icon: Calendar },
        { label: "Ideas", href: `${ROUTES.ADMIN}/proposals`, icon: Lightbulb, badgeCount: attentionSummary.ideas.count },
        { label: "Attendance", href: `${ROUTES.ADMIN}/attendance`, icon: ClipboardCheck },
      ]
    });
  }

  if (permissions.canManageWebsite) {
    adminNavGroups.push({
      group: "Website",
      items: [
        { label: "Pages", href: `${ROUTES.ADMIN}/website`, icon: Globe },
        { label: "Gallery", href: `${ROUTES.ADMIN}/gallery`, icon: ImageIcon },
        { label: "Sponsors", href: `${ROUTES.ADMIN}/sponsors`, icon: HandCoins },
        { label: "Inquiries", href: `${ROUTES.ADMIN}/inquiries`, icon: Bell },
      ]
    });
  }

  if (permissions.canManageCommunication) {
    adminNavGroups.push({
      group: "Communication",
      items: [
        { label: "Announcements", href: `${ROUTES.ADMIN}/announcements`, icon: Bell },
        { label: "Emails", href: `${ROUTES.ADMIN}/communications`, icon: Mail },
      ]
    });
  }

  if (permissions.canViewFinance) {
    adminNavGroups.push({
      group: "Finance",
      items: [
        { label: "Overview", href: `${ROUTES.ADMIN}/finance`, icon: Banknote },
        { label: "Transactions", href: `${ROUTES.ADMIN}/finance/transactions`, icon: ArrowLeftRight, badgeCount: attentionSummary.finance.count },
        { label: "Payment Requests", href: `${ROUTES.ADMIN}/finance/requests`, icon: HandCoins },
        { label: "Budgets", href: `${ROUTES.ADMIN}/finance/budgets`, icon: PieChart },
        { label: "Reports", href: `${ROUTES.ADMIN}/finance/reports`, icon: FileSpreadsheet },
      ]
    });
  }

  if (permissions.canManageClub) {
    const settingsItems = [
      { label: "Club Settings", href: `${ROUTES.ADMIN}/settings`, icon: Settings },
    ];
    if (permissions.canManageSystem) {
      settingsItems.push({ label: "Access Management", href: `${ROUTES.ADMIN}/accounts`, icon: UserCircle });
    }
    adminNavGroups.push({
      group: "Settings",
      items: settingsItems
    });
  }

  return (
    <div className="h-screen overflow-hidden bg-background flex flex-col">
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

        <main className="flex-1 w-full p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <PageTransition className="max-w-6xl mx-auto">
            {children}
          </PageTransition>
        </main>
      </div>
    </div>
  );
}
