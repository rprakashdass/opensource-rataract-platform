import Link from "next/link";
import AdminSidebar from "@/components/layout/AdminSidebar";
import LogoutButton from "@/components/auth/LogoutButton";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
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
            Rotaract Admin
          </div>
          <div className="flex gap-6 items-center">
            {session && (
              <div className="flex flex-col text-right">
                <span className="text-sm font-semibold text-gray-900">{session.name}</span>
                <span className="text-xs text-gray-500">{session.role}</span>
              </div>
            )}
            <div className="w-px h-8 bg-gray-200 hidden md:block" />
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="flex max-w-[1600px] mx-auto w-full">
        <AdminSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
