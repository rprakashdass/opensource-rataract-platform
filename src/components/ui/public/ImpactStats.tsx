import { Users, Briefcase, Clock, Calendar } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

interface ImpactStatsProps {
  members: number;
  projects: number;
  hours: number;
  events: number;
}

export function ImpactStats({ members, projects, hours, events }: ImpactStatsProps) {
  return (
    <section className="py-12 bg-white relative z-20 -mt-12 sm:-mt-16 border-b border-slate-100">
      <MaxWidthWrapper>
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 md:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-slate-100">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-slate-900">{members}</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2">
                <Users className="w-4 h-4 text-amber-500" /> Active Members
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-slate-900">{projects}</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4 text-amber-500" /> Projects
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-black text-slate-900">{hours}</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" /> Vol. Hours
              </div>
            </div>
            <div className="space-y-2 border-none">
              <div className="text-4xl md:text-5xl font-black text-slate-900">{events}</div>
              <div className="text-slate-500 font-bold uppercase tracking-wider text-xs md:text-sm flex items-center justify-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" /> Events Held
              </div>
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
