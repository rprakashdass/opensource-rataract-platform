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

  const { canAccessAdminPortal, canViewFinance, canManageClub, canManageSystem, canManageWebsite, canManageCommunication } = await import("@/lib/auth/session");

  if (!canAccessAdminPortal(session)) {
    redirect("/admin/unauthorized");
  }

  const permissions = {
    canViewFinance: canViewFinance(session),
    canManageClub: canManageClub(session),
    canManageSystem: canManageSystem(session),
    canManageWebsite: canManageWebsite(session),
    canManageCommunication: canManageCommunication(session),
  };

  const club = await getCurrentClub();

  if (!club) {
    throw new Error("No club is configured for this site.");
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
        roles: session.roles,
        readNotifications: session.readNotifications,
        avatar: session.member?.avatar
      }}
      notifications={notifications}
      attentionSummary={attentionSummary}
      permissions={permissions}
    >
      {children}
    </AdminLayoutClient>
  );
}
