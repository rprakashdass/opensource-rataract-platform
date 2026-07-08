"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Settings, 
  UserCircle, 
  Banknote, 
  Bell,
  Briefcase,
  ClipboardCheck,
  Globe,
  ArrowLeftRight,
  PieChart,
  FileSpreadsheet
} from "lucide-react";
import { cn } from "@/lib/utils";

const navGroups = [
  {
    group: "",
    items: [
      { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard }
    ]
  },
  {
    group: "Operations",
    items: [
      { label: "Projects", href: `${ROUTES.ADMIN}/projects`, icon: Briefcase },
      { label: "Events", href: `${ROUTES.ADMIN}/events`, icon: Calendar },
      { label: "Members", href: `${ROUTES.ADMIN}/members`, icon: Users },
      { label: "Attendance", href: `${ROUTES.ADMIN}/attendance`, icon: ClipboardCheck },
    ]
  },
  {
    group: "Finance",
    items: [
      { label: "Overview", href: `${ROUTES.ADMIN}/finance`, icon: Banknote },
      { label: "Transactions", href: `${ROUTES.ADMIN}/finance/transactions`, icon: ArrowLeftRight },
      { label: "Budgets", href: `${ROUTES.ADMIN}/finance/budgets`, icon: PieChart },
      { label: "Reports", href: `${ROUTES.ADMIN}/finance/reports`, icon: FileSpreadsheet },
    ]
  },
  {
    group: "Content",
    items: [
      { label: "Website Preview", href: `${ROUTES.ADMIN}/website`, icon: Globe },
      { label: "Gallery", href: `${ROUTES.ADMIN}/gallery`, icon: ImageIcon },
      { label: "Announcements", href: `${ROUTES.ADMIN}/announcements`, icon: Bell },
    ]
  },
  {
    group: "Settings",
    items: [
      { label: "Club Settings", href: `${ROUTES.ADMIN}/settings`, icon: Settings },
      { label: "Users & Roles", href: `${ROUTES.ADMIN}/accounts`, icon: UserCircle },
    ]
  }
];

export function AdminNavItems({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hasProjectContext = searchParams.get("project");

  // Collect all nav hrefs to detect when a more-specific sibling is active
  const allNavHrefs = navGroups.flatMap(g => g.items.map(i => i.href));

  const isActive = (path: string) => {
    if (hasProjectContext) {
      if (path === `${ROUTES.ADMIN}/projects`) return true;
      if (path === `${ROUTES.ADMIN}/events`) return false;
    }
    // Exact match always wins
    if (pathname === path) return true;
    // Prefix match: only activate if no other nav item is a MORE specific match for the current path
    if (pathname.startsWith(path + "/")) {
      const moreSpecificMatch = allNavHrefs.some(
        href => href !== path && href.startsWith(path) && pathname.startsWith(href)
      );
      return !moreSpecificMatch;
    }
    return false;
  };

  return (
    <nav className="flex flex-col gap-6 p-4 pt-4">
      {navGroups.map((group, gIdx) => (
        <div key={gIdx} className={group.group ? "space-y-1" : ""}>
          {group.group ? (
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {group.group}
            </h3>
          ) : null}
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all text-sm",
                    active
                      ? "bg-slate-100 text-slate-900 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-4 w-4 flex-shrink-0", active ? "text-slate-900" : "text-slate-400")} />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-60 bg-white border-r border-slate-200 sticky top-[61px] h-[calc(100vh-61px)] overflow-y-auto flex-col flex-shrink-0">
      <AdminNavItems />
    </aside>
  );
}
