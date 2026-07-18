import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import {
  RevealBlock,
  Eyebrow,
  SectionHeader,
  PartnerRail,
  EmptyState,
} from "@/components/ui/public/v2";
import PartnerCTAButton from "./_components/PartnerCTAButton";

export const revalidate = 300;

// V1 copy kept as defaults — CMS sponsors* fields override when set.
const DEFAULT_HEADLINE = "Fund the year everyone remembers.";
const DEFAULT_SUPPORT =
  "We are students and young professionals volunteering in Coimbatore. Your support funds real projects — trees in the ground, books in classrooms, clean water for families.";
const DEFAULT_CTA = "Start a conversation";
const DEFAULT_MISSION =
  "Every tier funds a specific, trackable community deliverable. You'll receive a formal impact report after project completion.";

const WHY_PARTNER = [
  {
    keyword: "Direct impact",
    body: "Every rupee goes directly to a named project — no overhead mystery. We publish photos and reports for every campaign we run.",
  },
  {
    keyword: "Youth network",
    body: "Reach a vibrant community of students, young professionals, and Rotarians across Coimbatore and the district.",
  },
  {
    keyword: "Documented delivery",
    body: "You receive a formal impact letter after campaign completion — suitable for your CSR annual report and tax filings.",
  },
];

const getCachedCauses = unstable_cache(
  async (clubId: string) => {
    const [projects, events] = await Promise.all([
      prisma.project.findMany({
        where: { clubId, seekingSponsorship: true },
        select: { id: true, title: true, sponsorshipGoal: true, sponsorshipPitch: true, status: true },
        orderBy: { createdAt: "desc" }
      }),
      prisma.event.findMany({
        where: { clubId, seekingSponsorship: true },
        select: { id: true, title: true, sponsorshipGoal: true, sponsorshipPitch: true, fundsRaised: true, status: true },
        orderBy: { createdAt: "desc" }
      })
    ]);

    const mappedProjects = projects.map(p => ({ ...p, causeType: "PROJECT" as const }));
    const mappedEvents = events.map(e => ({ ...e, causeType: "EVENT" as const }));

    return [...mappedProjects, ...mappedEvents].sort((a, b) => b.title.localeCompare(a.title));
  },
  ["fundable-causes"],
  { tags: ["sponsorship-causes"], revalidate: 3600 }
);

export default async function PartnerPage() {
  const club = await getCurrentClub();
  if (!club) return null;

  const settings = await getOrCreateWebsiteSettings(club.id);

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

  const causes = await getCachedCauses(club.id);

  const contactEmail = club.email || "contact@rotaract.org";
  const headline = settings?.sponsorsTitle || DEFAULT_HEADLINE;
  const support = settings?.sponsorsSubtitle || DEFAULT_SUPPORT;
  const ctaText = settings?.sponsorsCTA || DEFAULT_CTA;
  const mission = settings?.sponsorsMission || DEFAULT_MISSION;

  return (
    <main className="min-h-screen bg-paper">
      {/* ── Dark chapter hero ─────────────────────────────────── */}
      <section className="bg-chapter pt-44 pb-24" data-thadam-dark aria-label="Partner with us">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow onDark className="mb-5">
              {club.name}
            </Eyebrow>
            <h1 className="font-display font-medium text-parchment tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              {headline}
            </h1>
            <p className="mt-6 text-lg text-parchment/75 leading-relaxed max-w-xl">{support}</p>
            <div className="mt-10">
              <PartnerCTAButton
                contactEmail={contactEmail}
                clubName={club.name}
                subject={`Partnership Inquiry — ${club.name}`}
                className="motion-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-brand text-chapter hover:bg-parchment transition-colors"
              >
                {ctaText}
              </PartnerCTAButton>
            </div>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {/* ── Proof: sponsorship packages as ruled pricing rows ─── */}
      <section className="py-20 md:py-28 bg-paper" aria-label="Sponsorship packages">
        <MaxWidthWrapper>
          <SectionHeader eyebrow="Sponsorship" heading="Pick what you fund." support={mission} />

          {packages.length > 0 ? (
            <div className="border-t border-hairline">
              {packages.map((pkg, i) => {
                // No explicit featured flag in data — the highest tier carries the highlight.
                const featured = packages.length > 1 && i === packages.length - 1;
                return (
                  <RevealBlock key={pkg.id}>
                    <div
                      className={`grid grid-cols-1 md:grid-cols-12 gap-x-8 gap-y-3 py-8 border-b border-hairline ${
                        featured ? "bg-wash rounded-xl px-6 md:-mx-6" : ""
                      }`}
                    >
                      <div className="md:col-span-3">
                        <h3 className="font-display font-medium text-xl text-ink tracking-[-0.01em]">
                          {pkg.title}
                        </h3>
                      </div>
                      <div className="md:col-span-3">
                        <p className="font-display font-medium tabular-nums text-ink tracking-[-0.01em] text-[clamp(1.6rem,3vw,2.2rem)] leading-none">
                          ₹{pkg.amount.toLocaleString("en-IN")}
                        </p>
                      </div>
                      <div className="md:col-span-6 space-y-2">
                        <p className="font-medium text-ink leading-snug">{pkg.impactText}</p>
                        {pkg.description && (
                          <p className="text-sm text-ink-soft leading-relaxed">{pkg.description}</p>
                        )}
                        <PartnerCTAButton
                          contactEmail={contactEmail}
                          clubName={club.name}
                          subject={`Sponsoring: ${pkg.title}`}
                          className="thadam-link text-sm font-semibold text-trail"
                        >
                          Pledge this cause →
                        </PartnerCTAButton>
                      </div>
                    </div>
                  </RevealBlock>
                );
              })}
            </div>
          ) : (
            <EmptyState
              title="This season's sponsorship tiers are still being drawn up."
              detail="Write to us and we'll share the current campaign brief and what it funds."
            />
          )}
        </MaxWidthWrapper>
      </section>

      {/* ── Causes seeking funding ────────────────────────────── */}
      {causes.length > 0 && (
        <section className="py-20 md:py-28 bg-paper border-t border-hairline" aria-label="Causes seeking funding">
          <MaxWidthWrapper>
            <SectionHeader eyebrow="Fundable Causes" heading="Help us make it happen." support="Directly fund a specific project or event. 100% of your pledge goes to the cause." />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
              {causes.map((cause) => (
                <RevealBlock key={`${cause.causeType}-${cause.id}`} className="bg-wash border border-hairline rounded-2xl p-6 flex flex-col justify-between group hover:border-brand/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-1 rounded bg-trail/10 text-trail">
                        {cause.causeType}
                      </span>
                    </div>
                    <h3 className="font-display font-medium text-xl text-ink tracking-[-0.01em] mb-2">
                      {cause.title}
                    </h3>
                    {cause.sponsorshipPitch && (
                      <p className="text-sm text-ink-soft leading-relaxed mb-6">{cause.sponsorshipPitch}</p>
                    )}
                    
                    {cause.sponsorshipGoal && (
                      <div className="mb-6">
                        <div className="flex justify-between text-sm mb-1.5 font-medium">
                          <span className="text-ink-soft">Goal</span>
                          <span className="text-ink">₹{cause.sponsorshipGoal.toLocaleString("en-IN")}</span>
                        </div>
                        {cause.causeType === "EVENT" && cause.fundsRaised != null && (
                          <>
                            <div className="h-1.5 w-full bg-hairline rounded-full overflow-hidden mb-1.5">
                              <div
                                className="h-full bg-brand rounded-full transition-all"
                                style={{ width: `${Math.min(100, (Number(cause.fundsRaised) / Number(cause.sponsorshipGoal)) * 100)}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-brand font-medium">₹{Number(cause.fundsRaised).toLocaleString("en-IN")} raised</span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 mt-auto border-t border-hairline">
                    <PartnerCTAButton
                      contactEmail={contactEmail}
                      clubName={club.name}
                      subject={`Sponsoring ${cause.causeType}: ${cause.title}`}
                      causeType={cause.causeType}
                      causeId={cause.id}
                      causeName={cause.title}
                      className="motion-button w-full rounded-xl bg-ink text-paper hover:bg-ink/90 text-sm font-semibold py-3 transition-colors text-center"
                    >
                      Pledge to {cause.causeType.toLowerCase()}
                    </PartnerCTAButton>
                  </div>
                </RevealBlock>
              ))}
            </div>
          </MaxWidthWrapper>
        </section>
      )}

      {/* ── Why partner ───────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-wash" aria-label="Why partner with us">
        <MaxWidthWrapper>
          <SectionHeader eyebrow="Why partner" heading="Real projects. Real people." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHY_PARTNER.map((item) => (
              <RevealBlock key={item.keyword} className="border-t border-hairline pt-6">
                <h3 className="font-display font-medium text-xl text-ink tracking-[-0.01em]">
                  {item.keyword}
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">{item.body}</p>
              </RevealBlock>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* ── Current sponsors ──────────────────────────────────── */}
      <PartnerRail
        heading="Those who believed first"
        sponsors={sponsors.map((s) => ({
          id: s.id,
          name: s.name,
          logoUrl: s.logo,
          website: s.website,
        }))}
      />

      {/* ── Invite ────────────────────────────────────────────── */}
      <section className="bg-wash py-24 md:py-32" aria-label="Start a conversation">
        <MaxWidthWrapper>
          <RevealBlock className="max-w-3xl">
            <p className="font-display font-medium tracking-[-0.015em] leading-[1.1] text-ink text-[clamp(2.2rem,5.5vw,4rem)] text-balance">
              Start a conversation.
            </p>
            <p className="mt-6 text-ink-soft leading-relaxed max-w-md">
              Drop us a line and we'll share our active campaign brief and impact deck. No
              corporate formalities — just a conversation.
            </p>
            <div className="mt-10">
              <PartnerCTAButton
                contactEmail={contactEmail}
                clubName={club.name}
                subject={`Partnership Inquiry — ${club.name}`}
                className="motion-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-brand text-white hover:bg-brand-deep transition-colors"
              >
                Write to {contactEmail}
              </PartnerCTAButton>
            </div>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
