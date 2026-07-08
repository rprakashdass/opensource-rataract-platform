import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import LoginForm from "./LoginForm";
import { ROUTES } from "@/lib/constants";

export default async function LoginPage() {
  const session = await getSession();
  
  if (session) {
    redirect(ROUTES.DASHBOARD);
  }

  return <LoginForm />;
}
