import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import ProfileForm from "./_components/ProfileForm";

import { redirect } from "next/navigation";

export default async function MemberProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: { member: true }
  });

  if (!user?.member) {
    return <div className="p-8">Member profile not found. Please contact an administrator.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
          Your Profile
        </h1>
        <p className="text-base text-gray-500 max-w-2xl">
          Keep your contact information and Rotaract profile up to date.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 px-6 py-5 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Personal Information</h2>
        </div>
        <div className="p-6">
          <ProfileForm member={user.member} />
        </div>
      </div>
    </div>
  );
}
