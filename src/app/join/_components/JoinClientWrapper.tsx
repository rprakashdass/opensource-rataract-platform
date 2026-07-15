"use client";

import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { RevealBlock, Eyebrow, SectionHeader } from "@/components/ui/public/v2";
import JoinUsForm from "./JoinUsForm";
import { useCmsPreview } from "@/hooks/useCmsPreview";

interface JoinSettings {
  joinTitle?: string | null;
  joinSubtitle?: string | null;
  joinSuccessTitle?: string | null;
  joinSuccessDesc?: string | null;
}

const WHAT_YOU_BECOME = [
  {
    keyword: "Lead",
    body: "Run a project end to end. Learn to move people long before a job title asks you to.",
  },
  {
    keyword: "Serve",
    body: "Show up where the city needs hands. Leave every place better than you found it.",
  },
  {
    keyword: "Belong",
    body: "Find the people who show up too. Some of them become friends for life.",
  },
];

const THE_PATH = [
  {
    numeral: "1",
    title: "Come to an event",
    body: "Most of our events are open to everyone. Come see how we work.",
  },
  {
    numeral: "2",
    title: "Volunteer once",
    body: "Join us for a project day. No commitment — just your hands and a morning.",
  },
  {
    numeral: "3",
    title: "Apply to join",
    body: "Fill in the form below and a member of our board will reach out.",
  },
];

export default function JoinClientWrapper({
  clubId,
  clubName,
  initialSettings,
  isPreview,
}: {
  clubId: string;
  clubName: string;
  initialSettings: JoinSettings;
  isPreview: boolean;
}) {
  const settings = useCmsPreview(initialSettings, { enabled: isPreview, channel: "join" });

  return (
    <main className="min-h-screen bg-paper">
      {/* ── Dark chapter hero ─────────────────────────────────── */}
      <section className="bg-chapter pt-44 pb-24" data-thadam-dark aria-label={`Join ${clubName}`}>
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow onDark className="mb-5">
              {clubName}
            </Eyebrow>
            <h1 className="font-display font-medium text-parchment tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              {settings.joinTitle || "Leave your mark."}
            </h1>
            <p className="mt-6 text-lg text-parchment/75 leading-relaxed max-w-xl">
              {settings.joinSubtitle ||
                "We are a network of young leaders committed to making a difference in our community and the world. Fill out the form below and our board will get in touch with you!"}
            </p>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      {/* ── What you become ───────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-paper" aria-label="What you become">
        <MaxWidthWrapper>
          <SectionHeader eyebrow="What you become" heading="More than a member." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {WHAT_YOU_BECOME.map((item) => (
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

      {/* ── The path ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-wash" aria-label="How to join">
        <MaxWidthWrapper>
          <SectionHeader eyebrow="The path" heading="Three steps in." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {THE_PATH.map((step) => (
              <RevealBlock key={step.numeral} className="border-t border-hairline pt-6">
                <span className="font-display font-medium italic text-3xl text-ochre-deep leading-none">
                  {step.numeral}
                </span>
                <h3 className="mt-4 font-display font-medium text-xl text-ink tracking-[-0.01em]">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm text-ink-soft leading-relaxed">{step.body}</p>
              </RevealBlock>
            ))}
          </div>
        </MaxWidthWrapper>
      </section>

      {/* ── The form ──────────────────────────────────────────── */}
      <section className="py-20 md:py-28 bg-paper" aria-label="Application form">
        <MaxWidthWrapper>
          <RevealBlock className="bg-wash rounded-xl p-8 md:p-12 max-w-2xl mx-auto">
            <Eyebrow className="mb-4">Apply to join</Eyebrow>
            <h2 className="font-display font-medium text-ink tracking-[-0.01em] leading-[1.1] text-[clamp(1.6rem,3.5vw,2.2rem)] mb-8">
              Tell us who you are.
            </h2>
            <JoinUsForm
              clubId={clubId}
              successTitle={settings.joinSuccessTitle || undefined}
              successDesc={settings.joinSuccessDesc || undefined}
            />
          </RevealBlock>
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
