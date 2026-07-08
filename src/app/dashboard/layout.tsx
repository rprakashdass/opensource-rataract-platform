import { getSession } from "@/lib/auth/session";
import DashboardLayoutClient from "./_components/DashboardLayoutClient";
import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const club = await getCurrentClub();
  if (!club) {
    redirect("/setup");
  }

  const session = await getSession();
  const roles = session?.roles || [];

  return (
    <DashboardLayoutClient roles={roles}>
      {children}
    </DashboardLayoutClient>
  );
}
