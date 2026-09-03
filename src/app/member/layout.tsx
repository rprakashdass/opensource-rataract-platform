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
    throw new Error("No club is configured for this site.");
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
        roles: session.roles,
        readNotifications: session.readNotifications,
        avatar: session.member?.avatar
      }}
      notifications={notifications}
    >
      {children}
    </DashboardLayoutClient>
  );
}
