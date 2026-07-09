import {
  HeartHandshake, Globe, Share2, BookOpen, UserPlus, Users, Briefcase,
  Mic2, Radio, Wrench, Computer, Circle, LucideIcon
} from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

const ICON_MAP: Record<string, LucideIcon> = {
  HeartHandshake, Globe, Share2, BookOpen, UserPlus, Users, Briefcase,
  Mic2, Radio, Wrench, Computer, Globe2: Globe, Circle
};

function resolveIcon(iconName?: string | null): LucideIcon {
  if (!iconName) return Circle;
  return ICON_MAP[iconName] || Circle;
}

interface Portfolio {
  id: string;
  name: string;
  icon?: string | null;
  description?: string | null;
}

export function AvenuesOfService({ portfolios }: { portfolios: Portfolio[] }) {
  if (!portfolios || portfolios.length === 0) return null;

  return (
    <section className="py-24 bg-slate-50">
      <MaxWidthWrapper>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">What We Do</h2>
          <p className="text-lg text-slate-500 font-medium">
            Our club operates across {portfolios.length} {portfolios.length === 1 ? "avenue" : "avenues"} of service, empowering our members to make a holistic impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {portfolios.map((portfolio) => {
            const Icon = resolveIcon(portfolio.icon);
            return (
              <div key={portfolio.id} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  <Icon className="w-7 h-7 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{portfolio.name}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {portfolio.description || ""}
                </p>
              </div>
            );
          })}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
