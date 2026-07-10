import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminLayoutClient from "./layout-client";
import { getRecentNotifications } from "@/lib/notifications";
import { getAttentionSummary } from "@/features/admin/queries/getAttentionSummary";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const isAdmin = session.roles?.some((role: string) =>
    ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER", "EVENTS_ADMIN", "CONTENT_ADMIN"].includes(role)
  );

  if (!isAdmin) {
    redirect("/");
  }

  const club = await getCurrentClub();

  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-xl font-bold text-slate-900">Couldn't load club data</h1>
          <p className="text-sm text-slate-500">
            Your session is valid, but the database didn't return a club record. This is usually a
            transient connection issue — try refreshing. If it persists, check your database connection.
          </p>
        </div>
      </div>
    );
  }

  const notifications = await getRecentNotifications(club.id);
  const attentionSummary = await getAttentionSummary(club.id, session.roles);

  return (
    <AdminLayoutClient
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
      attentionSummary={attentionSummary}
    >
      {children}
    </AdminLayoutClient>
  );
}
