import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PartnerPage() {
  const club = await getCurrentClub();
  if (!club) return <div>Loading...</div>;

  const sponsors = await prisma.sponsor.findMany({
    where: { clubId: club.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      <div className="bg-slate-900 text-white pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500 via-transparent to-transparent" />
        <MaxWidthWrapper className="relative z-10 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <span className="text-sm font-extrabold text-amber-400 uppercase tracking-widest">
              Partner With Us
            </span>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight">
              Empower The Next Generation
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed">
              Join {club.shortName || club.name} in making a sustainable impact. We connect brands with passionate youth leaders working on grassroots community projects.
            </p>
            <div className="pt-4">
              <Button asChild className="bg-amber-500 hover:bg-amber-600 text-white font-bold px-8 py-6 rounded-xl text-lg">
                <a href={`mailto:${club.email || ""}?subject=Partnership Inquiry`}>Get In Touch</a>
              </Button>
            </div>
          </div>
        </MaxWidthWrapper>
      </div>

      <MaxWidthWrapper className="py-24 space-y-32">
        
        {/* Why Sponsor Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-xl font-bold">Direct Community Impact</h3>
            <p className="text-slate-600">Your sponsorship goes directly towards funding grassroots projects in healthcare, education, and environment.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            </div>
            <h3 className="text-xl font-bold">Brand Visibility</h3>
            <p className="text-slate-600">Reach a vibrant network of young professionals, community leaders, and Rotarians across our district.</p>
          </div>
          <div className="space-y-4 text-center md:text-left">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto md:mx-0">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
            <h3 className="text-xl font-bold">Tax Deductible</h3>
            <p className="text-slate-600">As a recognized community service organization, contributions to our flagship projects often qualify for tax benefits.</p>
          </div>
        </section>

        {/* Sponsors Display */}
        {sponsors.length > 0 && (
          <section>
            <div className="text-center mb-16">
              <h2 className="text-3xl font-black mb-4">Our Partners & Sponsors</h2>
              <p className="text-slate-500 max-w-xl mx-auto">We are incredibly grateful for the organizations that have supported our mission this year.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
              {sponsors.map((sponsor) => (
                <div key={sponsor.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 text-center hover:shadow-md transition">
                  {sponsor.logo ? (
                    <img src={sponsor.logo} alt={sponsor.name} className="h-20 object-contain mx-auto mb-4" />
                  ) : (
                    <div className="h-20 flex items-center justify-center bg-slate-50 text-slate-400 font-bold rounded-lg mb-4">
                      {sponsor.name}
                    </div>
                  )}
                  <h4 className="font-bold text-slate-900">{sponsor.name}</h4>
                  {sponsor.website && (
                    <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-600 hover:underline mt-1 block">Visit Website</a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="bg-amber-50 rounded-3xl p-12 text-center border border-amber-100">
          <h2 className="text-3xl font-black text-amber-900 mb-4">Ready to make a difference?</h2>
          <p className="text-amber-700 max-w-2xl mx-auto mb-8 text-lg">
            Whether you want to sponsor our flagship marathon, partner on a blood donation drive, or support our education initiatives, we have a package for you.
          </p>
          <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-6 rounded-xl text-lg shadow-lg shadow-amber-200">
            <a href={`mailto:${club.email || ""}?subject=Sponsorship Package Details`}>Request Sponsorship Deck</a>
          </Button>
        </section>

      </MaxWidthWrapper>
    </main>
  );
}
