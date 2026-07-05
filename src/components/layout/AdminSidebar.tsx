"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { LayoutDashboard, Users, Calendar, Image as ImageIcon, Settings, UserCircle, Banknote, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Users2, Calendar, Image as ImageIcon, Settings, UserCircle, Banknote, Bell } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard },
  { label: "Accounts", href: `${ROUTES.ADMIN}/accounts`, icon: UserCircle },
  { label: "Members", href: `${ROUTES.ADMIN}/members`, icon: Users },
  { label: "Finance & Treasury", href: `${ROUTES.ADMIN}/finance`, icon: Banknote },
  { label: "Events & Initiatives", href: `${ROUTES.ADMIN}/events`, icon: Calendar },
  { label: "Meetings & Minutes", href: `${ROUTES.ADMIN}/meetings`, icon: BookOpen },
  { label: "Gallery", href: `${ROUTES.ADMIN}/gallery`, icon: ImageIcon },
  { label: "Club Settings", href: `${ROUTES.ADMIN}/settings`, icon: Settings },
];

export function AdminNavItems({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === ROUTES.ADMIN && pathname === ROUTES.ADMIN) return true;
    if (path !== ROUTES.ADMIN && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="space-y-1 p-4">
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onClose}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm",
              active
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon className={cn("h-5 w-5 flex-shrink-0", active ? "text-purple-700" : "text-gray-400")} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
  const navItems = [
    { label: "Dashboard", href: ROUTES.ADMIN, icon: LayoutDashboard },
    { label: "Accounts", href: `${ROUTES.ADMIN}/accounts`, icon: UserCircle },
    { label: "Members", href: `${ROUTES.ADMIN}/members`, icon: Users },
    { label: "Finance & Treasury", href: `${ROUTES.ADMIN}/finance`, icon: Banknote },
    { label: "Events & Initiatives", href: `${ROUTES.ADMIN}/events`, icon: Calendar },
    { label: "Announcements", href: `${ROUTES.ADMIN}/announcements`, icon: Bell },
    { label: "Gallery", href: `${ROUTES.ADMIN}/gallery`, icon: ImageIcon },
    { label: "Club Settings", href: `${ROUTES.ADMIN}/settings`, icon: Settings },
  ];

export default function AdminSidebar() {
  return (
    <aside className="hidden md:flex w-56 lg:w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-57px)] flex-col flex-shrink-0">
      <AdminNavItems />
    </aside>
  );
}
