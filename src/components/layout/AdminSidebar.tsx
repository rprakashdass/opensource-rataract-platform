"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/lib/constants";
import { LayoutDashboard, Users, Users2, Calendar, Image as ImageIcon, Settings, UserCircle, Banknote, BookOpen } from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === ROUTES.ADMIN && pathname === ROUTES.ADMIN) return true;
    if (path !== ROUTES.ADMIN && pathname.startsWith(path)) return true;
    return false;
  };

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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-4 flex flex-col">
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                active 
                  ? "bg-purple-50 text-purple-700" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-purple-700" : "text-gray-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
