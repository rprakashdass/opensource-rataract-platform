import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import Link from "next/link";
import { IndianRupee, ArrowRight, TreePine, Users, Droplets, Heart } from "lucide-react";

// Map impact keywords to icons
function getImpactIcon(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("tree") || lower.includes("plant")) return TreePine;
  if (lower.includes("student") || lower.includes("school") || lower.includes("child")) return Users;
  if (lower.includes("water") || lower.includes("clean")) return Droplets;
  return Heart;
}

export default async function PartnerPage() {
  const club = await getCurrentClub();
  if (!club) return null;

  const sponsors = await prisma.sponsor.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" },
  });

  let packages: any[] = [];
  try {
    packages = await prisma.sponsorshipPackage.findMany({
      where: { clubId: club.id, isActive: true },
      orderBy: { amount: "asc" },
    });
  } catch {
    packages = [];
  }

  const contactEmail = club.email || "contact@rotaract.org";

  return (
    <main className="min-h-screen bg-[#FAF9F6]">

      {/* ─── HERO ──────────────────────────────────────────────── */}
      <section
        className="relative min-h-[92vh] flex flex-col justify-end bg-[#0B132B] overflow-hidden"
        aria-label="Partner with us hero"
      >
        {/* Subtle grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Warm glow top-right */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-[#F7A800]/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-[#003DA5]/20 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto w-full px-6 md:px-12 pb-20 pt-40">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <span className="h-px w-10 bg-[#F7A800]" />
            <span className="text-[#F7A800] font-black text-xs uppercase tracking-[0.25em]">
              {club.name}
            </span>
          </div>

          {/* Hero Quote */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white leading-[1.0] tracking-tight mb-10 max-w-3xl">
            Be the reason<br />
            <span className="text-[#F7A800]">we kept going.</span>
          </h1>

          <p className="text-white/60 text-base md:text-lg font-medium max-w-xl leading-relaxed mb-12">
            We are students and young professionals volunteering in Coimbatore.
            Your support funds real projects — trees in the ground, books in classrooms,
            clean water for families.
          </p>

          {/* Stats row */}
          {packages.length > 0 && (
            <div className="flex flex-wrap gap-8 mb-14">
              {packages.map((pkg) => {
                const Icon = getImpactIcon(pkg.impactText);
                return (
                  <div key={pkg.id} className="flex items-center gap-2 text-white/80">
                    <Icon className="w-4 h-4 text-[#F7A800] shrink-0" />
                    <span className="font-black text-sm">{pkg.impactText}</span>
                    <span className="text-white/30 text-xs font-medium">
                      @ ₹{pkg.amount.toLocaleString("en-IN")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          <a
            href={`mailto:${contactEmail}?subject=Partnership Inquiry — ${club.name}`}
            className="inline-flex items-center gap-3 bg-[#F7A800] hover:bg-[#e09700] text-[#0B132B] font-black text-sm uppercase tracking-widest px-8 py-4 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            Start a conversation
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Scroll hint */}
        <div className="relative z-10 pb-8 flex justify-center">
          <div className="w-px h-12 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* ─── PACKAGES (PLEDGE CARDS) ───────────────────────────── */}
      {packages.length > 0 && (
        <section className="py-28 px-6 md:px-12 max-w-5xl mx-auto" aria-label="Sponsorship packages">
          <div className="mb-16">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#003DA5]">
              Active Campaigns
            </span>
            <h2 className="text-4xl md:text-5xl font-black text-[#0B132B] tracking-tight mt-3 leading-tight">
              Pick your pledge.
            </h2>
            <p className="text-slate-500 font-medium mt-3 max-w-lg">
              Every tier funds a specific, trackable community deliverable.
              You'll receive a formal impact report after project completion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {packages.map((pkg, i) => {
              const Icon = getImpactIcon(pkg.impactText);
              const isHighlighted = i === packages.length - 1;

              return (
                <div
                  key={pkg.id}
                  className={`
                    group relative rounded-3xl p-8 md:p-10 flex flex-col justify-between min-h-[360px] overflow-hidden
                    transition-all duration-300 hover:-translate-y-1
                    ${isHighlighted
                      ? "bg-[#0B132B] text-white"
                      : "bg-white border border-slate-200/80 shadow-sm hover:shadow-md"
                    }
                  `}
                >
                  {/* Background glow for highlighted card */}
                  {isHighlighted && (
                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-[#F7A800]/10 blur-[80px] pointer-events-none" />
                  )}

                  <div className="relative z-10 space-y-6">
                    {/* Icon + Amount */}
                    <div className="flex items-start justify-between">
                      <div
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center
                          ${isHighlighted ? "bg-[#F7A800]/15 text-[#F7A800]" : "bg-[#0B132B]/6 text-[#0B132B]"}
                        `}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={`flex items-center gap-0.5 font-black text-sm ${isHighlighted ? "text-white/40" : "text-slate-400"}`}>
                        <IndianRupee className="w-3.5 h-3.5" />
                        <span>{pkg.amount.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    {/* Giant impact stat */}
                    <div>
                      <p
                        className={`text-4xl md:text-5xl font-black leading-none tracking-tight
                          ${isHighlighted ? "text-[#F7A800]" : "text-[#0B132B]"}
                        `}
                      >
                        {pkg.impactText}
                      </p>
                    </div>

                    {/* Title + Description */}
                    <div>
                      <h3
                        className={`text-base font-black uppercase tracking-wider mb-2
                          ${isHighlighted ? "text-white" : "text-[#0B132B]"}
                        `}
                      >
                        {pkg.title}
                      </h3>
                      {pkg.description && (
                        <p
                          className={`text-sm leading-relaxed font-medium line-clamp-3
                            ${isHighlighted ? "text-white/50" : "text-slate-500"}
                          `}
                        >
                          {pkg.description}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA */}
                  <a
                    href={`mailto:${contactEmail}?subject=Sponsoring: ${pkg.title}`}
                    className={`
                      relative z-10 mt-8 w-full flex items-center justify-center gap-2 font-black text-xs uppercase tracking-widest py-4 rounded-2xl transition-all duration-200
                      ${isHighlighted
                        ? "bg-[#F7A800] text-[#0B132B] hover:bg-[#e09700]"
                        : "bg-[#0B132B] text-white hover:bg-[#1a2645]"
                      }
                    `}
                  >
                    Pledge this cause
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── WHY SPONSOR ───────────────────────────────────────── */}
      <section className="bg-[#0B132B] py-28 px-6 md:px-12">
        <div className="max-w-5xl mx-auto">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-[#F7A800]">
            Why partner with us
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-3 mb-16 leading-tight">
            Real projects.<br />Real people.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                number: "01",
                title: "Direct Impact",
                body: "Every rupee goes directly to a named project — no overhead mystery. We publish photos and reports for every campaign we run.",
              },
              {
                number: "02",
                title: "Youth Network",
                body: "Reach a vibrant community of students, young professionals, and Rotarians across Coimbatore and the district.",
              },
              {
                number: "03",
                title: "Documented Delivery",
                body: "You receive a formal impact letter after campaign completion — suitable for your CSR annual report and tax filings.",
              },
            ].map((item) => (
              <div key={item.number} className="border-t border-white/10 pt-8 space-y-4">
                <span className="text-[#F7A800] font-black text-sm">{item.number}</span>
                <h3 className="text-white font-black text-lg">{item.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed font-medium">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CURRENT SPONSORS ──────────────────────────────────── */}
      {sponsors.length > 0 && (
        <section className="py-24 px-6 md:px-12 max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-[#003DA5]">
              Patron Organizations
            </span>
            <h2 className="text-3xl font-black text-[#0B132B] mt-3">
              Those who believed first.
            </h2>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {sponsors.map((sponsor) => (
              <a
                key={sponsor.id}
                href={sponsor.website || undefined}
                target="_blank"
                rel="noopener noreferrer"
                title={sponsor.name}
                className="group bg-white border border-slate-200/60 rounded-2xl px-8 py-6 h-24 flex items-center justify-center shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 min-w-[160px]"
              >
                {sponsor.logo ? (
                  <img
                    src={sponsor.logo}
                    alt={sponsor.name}
                    className="max-h-10 max-w-[140px] object-contain opacity-70 group-hover:opacity-100 transition-opacity"
                  />
                ) : (
                  <span className="font-black text-sm text-slate-400 group-hover:text-[#0B132B] transition-colors">
                    {sponsor.name}
                  </span>
                )}
              </a>
            ))}
          </div>
        </section>
      )}

      {/* ─── FINAL CTA ─────────────────────────────────────────── */}
      <section className="py-28 px-6 md:px-12 bg-[#FAF9F6]">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-4xl md:text-6xl font-black text-[#0B132B] leading-tight">
            Ready to make<br />
            <span className="text-[#F7A800]">something happen?</span>
          </h2>
          <p className="text-slate-500 font-medium text-base leading-relaxed max-w-md mx-auto">
            Drop us an email and we'll share our active campaign brief and impact deck.
            No corporate formalities — just a conversation.
          </p>
          <a
            href={`mailto:${contactEmail}?subject=Partnership Inquiry — ${club.name}`}
            className="inline-flex items-center gap-3 bg-[#0B132B] hover:bg-[#1a2645] text-white font-black text-sm uppercase tracking-widest px-10 py-5 rounded-full transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
          >
            {contactEmail}
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

    </main>
  );
}
