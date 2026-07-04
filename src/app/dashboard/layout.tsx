import Link from "next/link";
import { ROUTES } from "@/lib/constants";
import LogoutButton from "@/components/auth/LogoutButton";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Rotaract
          </div>
          <div className="flex gap-6 items-center">
            {session && (
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-900">{session.name}</span>
                <span className="text-xs text-gray-500">Member Dashboard</span>
              </div>
            )}
            <div className="w-px h-8 bg-gray-200 hidden md:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <Link
              href={ROUTES.DASHBOARD}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Overview
            </Link>
            <Link
              href={`${ROUTES.DASHBOARD}/profile`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Profile
            </Link>
            <Link
              href={`${ROUTES.DASHBOARD}/events`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Events
            </Link>
            <Link
              href={`${ROUTES.DASHBOARD}/finance`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Finance & Dues
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
