import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import AdminLayoutClient from "./layout-client";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const club = await getCurrentClub();
  
  if (!club) {
    redirect("/setup");
  }

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

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
