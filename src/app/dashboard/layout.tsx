import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Rotaract
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">Member Dashboard</span>
            <Link href={ROUTES.HOME} className="text-gray-600 hover:text-gray-900">
              Logout
            </Link>
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
              href={ROUTES.DASHBOARD}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Profile
            </Link>
            <Link
              href={ROUTES.DASHBOARD}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Events
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
