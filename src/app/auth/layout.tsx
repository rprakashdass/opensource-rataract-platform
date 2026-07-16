import { getCurrentClub } from "@/lib/club";
import Link from "next/link";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const club = await getCurrentClub();

  return (
    <div className="min-h-screen bg-chapter relative flex flex-col items-center justify-center p-4 md:p-6 select-none bg-chapter">
      <div className="w-full max-w-[420px] relative z-10">
        <div className="bg-[#FAF8F5] border border-parchment/10 rounded-3xl p-8 md:p-10 shadow-2xl relative">
          
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-8">
            <Link href="/" className="group flex flex-col items-center gap-3">
              {club?.logoUrl ? (
                <div className="relative w-12 h-12 rounded-full overflow-hidden border border-slate-200 shadow-sm transition-transform duration-300 group-hover:scale-105">
                  <img src={club.logoUrl} alt={club.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full bg-pink-50 text-brand flex items-center justify-center font-bold text-lg border border-pink-100 shadow-sm">
                  {club?.name ? club.name.slice(0, 2).toUpperCase() : "RC"}
                </div>
              )}
              <div className="space-y-1">
                <span className="font-display font-bold text-slate-900 text-lg tracking-tight group-hover:text-brand transition-colors block">
                  {club?.name || "Rotaract Platform"}
                </span>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest block">
                  Portal Sign In
                </span>
              </div>
            </Link>
          </div>

          {/* Children form */}
          {children}

          {/* Back link */}
          <div className="mt-8 text-center border-t border-slate-200/60 pt-6">
            <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-brand transition-colors uppercase tracking-wider">
              ← Return to public site
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
