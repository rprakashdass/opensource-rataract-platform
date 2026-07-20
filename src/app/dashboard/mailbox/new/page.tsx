import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import NewMailForm from "./_components/NewMailForm";

export const metadata = { title: "New Message | Mailbox" };

export default async function NewMailPage() {
  const session = await getSession();
  if (!session) redirect("/auth/login");
  if (!session.member?.id) redirect("/dashboard");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Send a Message</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your message goes directly to the club administration board.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
        <NewMailForm />
      </div>
    </div>
  );
}
