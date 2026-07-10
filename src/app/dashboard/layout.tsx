import { getSession } from "@/lib/auth/session";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import { getRecentNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

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

  const notifications = await getRecentNotifications(club.id);

  return (
    <DashboardLayoutClient 
      roles={roles} 
      club={{
        name: club.name,
        logoUrl: club.logoUrl,
        tenureYear: club.tenureYear
      }}
      user={{
        name: session.name,
        email: session.email,
        roles: session.roles
      }}
      notifications={notifications}
    >
      {children}
    </DashboardLayoutClient>
  );
}
