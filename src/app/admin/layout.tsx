import Link from "next/link";
import { ROUTES } from "@/lib/constants";

export default function AdminLayout({
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
            Rotaract Admin
          </div>
          <div className="flex gap-4 items-center">
            <span className="text-gray-700">Administrator</span>
            <Link href={ROUTES.HOME} className="text-gray-600 hover:text-gray-900">
              Logout
            </Link>
          </div>
        </div>
        <div className="border-t border-gray-200 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-wrap gap-2 text-sm">
            <Link href={ROUTES.ADMIN} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-purple-700 hover:border-purple-200 transition">
              Dashboard
            </Link>
            <Link href={`${ROUTES.ADMIN}/members`} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-purple-700 hover:border-purple-200 transition">
              Members
            </Link>
            <Link href={`${ROUTES.ADMIN}/events`} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-purple-700 hover:border-purple-200 transition">
              Events
            </Link>
            <Link href={`${ROUTES.ADMIN}/gallery`} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-purple-700 hover:border-purple-200 transition">
              Gallery
            </Link>
            <Link href={`${ROUTES.ADMIN}/settings`} className="px-3 py-1.5 rounded-full bg-white border border-gray-200 text-gray-700 hover:text-purple-700 hover:border-purple-200 transition">
              Settings
            </Link>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-[calc(100vh-73px)] p-6">
          <nav className="space-y-2">
            <Link
              href={ROUTES.ADMIN}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition font-medium"
            >
              Dashboard
            </Link>
            <div className="border-t border-gray-200 my-4" />
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
              Management
            </div>
            <Link
              href={`${ROUTES.ADMIN}/accounts`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Accounts
            </Link>
            <Link
              href={`${ROUTES.ADMIN}/members`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Members
            </Link>
            <Link
              href={`${ROUTES.ADMIN}/events`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Initiatives & Events
            </Link>
            <Link
              href={`${ROUTES.ADMIN}/gallery`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Gallery
            </Link>
            <div className="border-t border-gray-200 my-4" />
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-2">
              Settings
            </div>
            <Link
              href={`${ROUTES.ADMIN}/settings`}
              className="block px-4 py-2 rounded hover:bg-purple-50 text-gray-700 hover:text-purple-700 transition"
            >
              Club Settings
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
