"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, Bell, ExternalLink, User as UserIcon, Settings, LogOut, ArrowRightLeft, Calendar, Banknote, FileText, Check } from "lucide-react";
import LogoutButton from "@/components/auth/LogoutButton";
import { useState, useRef, useEffect } from "react";
import { ROUTES } from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, LazyMotion, domMax, m } from "framer-motion";
import { motionVariants } from "@/lib/motion-tokens";

export type NotificationItem = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  type: "ANNOUNCEMENT" | "EVENT" | "FINANCE" | "MINUTE";
  href: string;
};

interface PortalHeaderProps {
  club: {
    name: string;
    logoUrl?: string | null;
    tenureYear: string;
  };
  user: {
    name: string;
    email: string;
    roles: string[];
  };
  notifications: NotificationItem[];
  onMobileMenuToggle: () => void;
  isAdminContext: boolean; // true if currently in /admin, false if in /dashboard
}

export function PortalHeader({ club, user, notifications, onMobileMenuToggle, isAdminContext }: PortalHeaderProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("read_notifications");
    if (stored) {
      try {
        setReadNotifIds(JSON.parse(stored));
      } catch (e) {
        // ignore JSON parse errors
      }
    }
  }, []);

  const markAsRead = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newReadIds = [...readNotifIds, id];
    setReadNotifIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    const newReadIds = Array.from(new Set([...readNotifIds, ...allIds]));
    setReadNotifIds(newReadIds);
    localStorage.setItem("read_notifications", JSON.stringify(newReadIds));
  };

  const unreadCount = notifications.filter(n => !readNotifIds.includes(n.id)).length;
  const hasUnread = unreadCount > 0;

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasAdminRole = user.roles.some((r) =>
    ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r)
  );

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  };

  const NotifIcon = ({ type }: { type: string }) => {
    switch (type) {
      case "ANNOUNCEMENT": return <Bell className="h-4 w-4 text-amber-500" />;
      case "EVENT": return <Calendar className="h-4 w-4 text-emerald-500" />;
      case "FINANCE": return <Banknote className="h-4 w-4 text-blue-500" />;
      case "MINUTE": return <FileText className="h-4 w-4 text-purple-500" />;
      default: return <Bell className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm pt-[env(safe-area-inset-top)] h-[calc(56px+env(safe-area-inset-top))] md:h-[calc(64px+env(safe-area-inset-top))] flex flex-col justify-center">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center w-full">
          {/* Left: Branding */}
          <div className="flex items-center gap-3 md:gap-4 flex-shrink min-w-0">
            <button
              className="md:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-slate-100 text-slate-600 transition"
              onClick={onMobileMenuToggle}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link href="/" className="flex items-center gap-2 md:gap-3 group min-w-0">
              {club.logoUrl ? (
                <div className="relative w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden border border-slate-100 flex-shrink-0">
                  <Image src={club.logoUrl} alt={club.name} fill className="object-cover" sizes="40px" />
                </div>
              ) : (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm md:text-base flex-shrink-0">
                  {getInitials(club.name)}
                </div>
              )}
              <div className="flex flex-col min-w-0">
                <span className="font-bold text-slate-900 truncate text-sm md:text-base group-hover:text-purple-700 transition-colors">
                  {club.name}
                </span>
                <span className="text-xs text-slate-500 truncate hidden sm:block">
                  RY {club.tenureYear}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <Link
              href="/"
              className="hidden md:flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-full transition-colors border border-slate-200"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit Website
            </Link>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative"
              >
                <Bell className="h-5 w-5" />
                {hasUnread && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                )}
              </button>

              <AnimatePresence>
                {notifOpen && (
                  <LazyMotion features={domMax}>
                    <m.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={motionVariants.dropdown}
                      className="absolute right-0 mt-2 w-80 md:w-96 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-semibold text-slate-900">Notifications</h3>
                        {hasUnread && (
                          <button 
                            onClick={markAllAsRead}
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-md transition-colors"
                          >
                            Mark all as read
                          </button>
                        )}
                      </div>
                      <div className="max-h-[360px] overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-500 text-sm">
                            No recent updates
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {notifications.map((n) => {
                              const isRead = readNotifIds.includes(n.id);
                              return (
                                <Link
                                  key={n.id}
                                  href={n.href}
                                  onClick={() => setNotifOpen(false)}
                                  className={`p-4 hover:bg-slate-50 transition-colors flex gap-3 ${isRead ? 'opacity-70' : 'bg-slate-50/30'}`}
                                >
                                  <div className="mt-0.5 flex-shrink-0 relative">
                                    <NotifIcon type={n.type} />
                                    {!isRead && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-white" />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-slate-900 truncate">{n.title}</p>
                                    {n.description && (
                                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{n.description}</p>
                                    )}
                                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider font-semibold">
                                      {formatDistanceToNow(n.date, { addSuffix: true })}
                                    </p>
                                  </div>
                                  {!isRead && (
                                    <button
                                      onClick={(e) => markAsRead(e, n.id)}
                                      className="self-center p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                                      title="Mark as read"
                                    >
                                      <Check className="w-4 h-4" />
                                    </button>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </m.div>
                  </LazyMotion>
                )}
              </AnimatePresence>
            </div>

            <div className="w-px h-6 bg-slate-200 hidden md:block mx-1" />

            {/* Profile Dropdown */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 md:pr-2 md:pl-1 bg-slate-50 hover:bg-slate-100 rounded-full border border-slate-200 transition-colors"
              >
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-xs md:text-sm shadow-sm">
                  {getInitials(user.name)}
                </div>
                <div className="hidden md:flex flex-col items-start pr-1">
                  <span className="text-sm font-semibold text-slate-900 leading-none">{user.name.split(" ")[0]}</span>
                </div>
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <LazyMotion features={domMax}>
                    <m.div
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      variants={motionVariants.dropdown}
                      className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden z-50 origin-top-right"
                    >
                      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
                        <p className="font-bold text-slate-900 truncate">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {user.roles.slice(0, 2).map((role) => (
                            <span key={role} className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded font-semibold uppercase">
                              {role.replace("_", " ")}
                            </span>
                          ))}
                          {user.roles.length > 2 && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
                              +{user.roles.length - 2}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-1">
                        <Link
                          href={`${ROUTES.DASHBOARD}/profile`}
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors w-full"
                        >
                          <UserIcon className="w-4 h-4 text-slate-400" />
                          My Profile
                        </Link>

                        {isAdminContext ? (
                          <Link
                            href={ROUTES.DASHBOARD}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors w-full"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                            Switch to Member Portal
                          </Link>
                        ) : hasAdminRole ? (
                          <Link
                            href={ROUTES.ADMIN}
                            onClick={() => setProfileOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors w-full"
                          >
                            <ArrowRightLeft className="w-4 h-4 text-slate-400" />
                            Switch to Admin Portal
                          </Link>
                        ) : null}

                        <div className="h-px bg-slate-100 my-1 mx-2" />

                        <Link
                          href="/"
                          onClick={() => setProfileOpen(false)}
                          className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition-colors w-full"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-400" />
                          Visit Website
                        </Link>

                        <div className="h-px bg-slate-100 my-1 mx-2" />

                        <div className="px-3 py-2 w-full text-left" onClick={() => setProfileOpen(false)}>
                          <LogoutButton />
                        </div>
                      </div>
                    </m.div>
                  </LazyMotion>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
