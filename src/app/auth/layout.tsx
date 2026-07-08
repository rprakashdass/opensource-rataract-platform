import { getCurrentClub } from "@/lib/club";
import { redirect } from "next/navigation";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const club = await getCurrentClub();
  if (!club) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <div className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Rotaract
            </div>
            <p className="text-sm text-slate-500 font-medium">Platform for Rotaract Clubs</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
