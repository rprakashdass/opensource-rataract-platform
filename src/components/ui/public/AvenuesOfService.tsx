import { HeartHandshake, Lightbulb, Users, Globe2 } from "lucide-react";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";

const avenues = [
  {
    title: "Community Service",
    description: "Creating lasting impact through local grassroots initiatives and sustainable community projects.",
    icon: HeartHandshake,
    color: "text-rose-500",
    bg: "bg-rose-50",
  },
  {
    title: "Professional Development",
    description: "Building leadership skills, networking, and career opportunities for young professionals.",
    icon: Lightbulb,
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Club Service",
    description: "Fostering lifelong friendships and building a strong, active, and supportive community.",
    icon: Users,
    color: "text-amber-500",
    bg: "bg-amber-50",
  },
  {
    title: "International Service",
    description: "Connecting with global partners to promote peace, understanding, and worldwide impact.",
    icon: Globe2,
    color: "text-emerald-500",
    bg: "bg-emerald-50",
  }
];

export function AvenuesOfService() {
  return (
    <section className="py-24 bg-slate-50">
      <MaxWidthWrapper>
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">What We Do</h2>
          <p className="text-lg text-slate-500 font-medium">
            Our club operates across four primary avenues of service, empowering our members to make a holistic impact.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {avenues.map((avenue) => {
            const Icon = avenue.icon;
            return (
              <div key={avenue.title} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className={`w-14 h-14 ${avenue.bg} rounded-2xl flex items-center justify-center mb-6`}>
                  <Icon className={`w-7 h-7 ${avenue.color}`} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{avenue.title}</h3>
                <p className="text-slate-500 leading-relaxed">
                  {avenue.description}
                </p>
              </div>
            );
          })}
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
