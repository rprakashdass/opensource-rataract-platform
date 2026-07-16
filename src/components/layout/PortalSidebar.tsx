"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
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
  FileSpreadsheet,
  Lightbulb,
  Receipt,
  Mail,
  PanelLeftClose,
  PanelLeftOpen,
  MessageSquare,
  FileText,
  HelpCircle,
  ShieldCheck,
  FolderKanban
} from "lucide-react";
import { useEffect, useState } from "react";
import { ROUTES } from "@/lib/constants";

export type NavItem = {
  label: string;
  href: string;
  icon: any;
  badgeCount?: number;
};

export type NavGroup = {
  group?: string;
  items: NavItem[];
};

interface PortalSidebarProps {
  navGroups: NavGroup[];
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export function PortalSidebar({ navGroups, isMobileOpen, onMobileClose }: PortalSidebarProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("sidebar_collapsed");
    if (stored === "true") {
      setIsCollapsed(true);
    }
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem("sidebar_collapsed", String(newState));
  };

  const allNavHrefs = navGroups.flatMap((g) => g.items.map((i) => i.href));

  const isActive = (path: string) => {
    if (pathname === path) return true;
    if (pathname.startsWith(path + "/")) {
      const moreSpecificMatch = allNavHrefs.some(
        (href) => href !== path && href.startsWith(path) && pathname.startsWith(href)
      );
      return !moreSpecificMatch;
    }
    return false;
  };

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => {
    const collapsed = mobile ? false : isCollapsed;
    return (
      <div className="flex flex-col h-full bg-white text-slate-900 border-r border-slate-200">
        {/* Mobile Close Button & Header area (only visible on mobile drawer) */}
        {mobile && (
          <div className="md:hidden flex items-center justify-between p-4 border-b border-slate-100">
            <span className="font-bold text-slate-800">Menu</span>
          </div>
        )}

        <nav className={cn("flex-1 overflow-y-auto py-4 flex flex-col gap-4", collapsed ? "px-2" : "px-4")}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className={group.group ? "space-y-1" : ""}>
              {group.group && !collapsed && (
                <h3 className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  {group.group}
                </h3>
              )}
              {group.group && collapsed && (
                <div className="w-full border-t border-slate-100 my-2" />
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => {
                        if (mobile) onMobileClose();
                      }}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        "flex items-center rounded-lg font-medium transition-all text-sm group relative",
                        collapsed ? "justify-center py-3 px-0" : "px-3 py-2.5 justify-between",
                        active
                          ? "bg-pink-50/80 text-brand font-semibold shadow-sm"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3 w-full min-w-0">
                        <Icon
                          className={cn(
                            "flex-shrink-0 transition-colors",
                            collapsed ? "h-5 w-5 mx-auto" : "h-4 w-4",
                            active ? "text-brand" : "text-slate-400 group-hover:text-slate-600"
                          )}
                        />
                        {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                      </div>
                      {item.badgeCount && item.badgeCount > 0 ? (
                        <span
                          className={cn(
                            "flex items-center justify-center font-bold",
                            collapsed
                              ? "absolute top-1 right-1 h-4 min-w-4 px-1 rounded-full text-[9px] bg-red-500 text-white"
                              : "h-5 min-w-5 px-1.5 rounded-full text-xs ml-auto",
                            !collapsed && active ? "bg-pink-100 text-brand" : !collapsed ? "bg-slate-100 text-slate-600" : ""
                          )}
                        >
                          {item.badgeCount}
                        </span>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Desktop Collapse Toggle */}
        {!mobile && (
          <div className="hidden md:flex p-3 border-t border-slate-100">
            <button
              onClick={toggleCollapse}
              className="flex items-center justify-center p-2 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors w-full"
              title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:block sticky top-[64px] h-[calc(100vh-64px)] z-30 transition-all duration-300 flex-shrink-0",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onMobileClose} />
          <aside className="absolute left-0 top-0 h-full w-72 bg-white shadow-xl flex flex-col animate-in slide-in-from-left-full duration-200">
            <SidebarContent mobile={true} />
          </aside>
        </div>
      )}
    </>
  );
}
