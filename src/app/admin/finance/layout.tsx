import { getSession, canViewFinance } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function FinanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session || !canViewFinance(session)) {
    redirect("/admin/unauthorized");
  }

  return <>{children}</>;
}
