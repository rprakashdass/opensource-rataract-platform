import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
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
                className="motion-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-ochre text-chapter hover:bg-parchment transition-colors"
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
                className="motion-button inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-[15px] font-semibold bg-ochre text-white hover:bg-ochre-deep transition-colors"
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
