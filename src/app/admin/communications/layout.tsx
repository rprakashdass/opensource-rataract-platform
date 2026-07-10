import { getSession, canManageCommunication } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !canManageCommunication(session)) {
    redirect("/admin/unauthorized");
  }

  return <>{children}</>;
}
