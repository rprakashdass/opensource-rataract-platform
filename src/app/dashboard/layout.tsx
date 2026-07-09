import { getSession } from "@/lib/auth/session";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) {
    redirect("/auth/login");
  }
  const roles = session.roles || [];

  const club = await getCurrentClub();
  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold text-slate-900">Couldn't load club data</h1>
          <p className="text-sm text-slate-500">
            Your session is valid, but the database didn't return a club record. This is usually a
            transient connection issue — try refreshing.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayoutClient roles={roles}>
      {children}
    </DashboardLayoutClient>
  );
}
