import { getCurrentClub } from "@/lib/club";
import { ClubLogo } from "@/components/ui/club-logo";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B132B] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl">
          {children}
        </div>
      </div>
    </div>
  );
}
