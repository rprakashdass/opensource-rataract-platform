import React from 'react';
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { RevealBlock, Eyebrow } from "@/components/ui/public/v2";

function LegalHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display font-medium tracking-[-0.01em] text-ink text-xl md:text-2xl mt-12 mb-4">
      {children}
    </h2>
  );
}

export default function TermsOfUsePage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <main className="min-h-screen bg-paper">
      {/* Compact hero */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-20 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">Legal</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              Terms of Use
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              Last updated: {currentDate}
            </p>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      <section className="pb-24 md:pb-32 bg-paper">
        <MaxWidthWrapper>
          <div className="max-w-3xl text-[15px] md:text-base text-ink-soft leading-relaxed [&_a]:text-trail [&_a]:underline">
            <LegalHeading>1. Purpose</LegalHeading>
            <p className="mb-6">
              This platform exists to support Rotaract club operations.
            </p>

            <LegalHeading>2. Member Responsibilities</LegalHeading>
            <p className="mb-4">Members agree to:</p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>Provide accurate information</li>
              <li>Respect other members</li>
              <li>Upload appropriate content only</li>
            </ul>

            <LegalHeading>3. Event Registration</LegalHeading>
            <p className="mb-2">
              Event participation is managed by the club.
            </p>
            <p className="mb-6">
              Registration does not guarantee availability unless confirmed.
            </p>

            <LegalHeading>4. Media Uploads</LegalHeading>
            <p className="mb-2">
              Members should only upload relevant club/event photos.
            </p>
            <p className="mb-6">
              Admins may remove inappropriate content.
            </p>

            <LegalHeading>5. Account Access</LegalHeading>
            <p className="mb-6">
              Members are responsible for their account security.
            </p>

            <LegalHeading>6. Platform Changes</LegalHeading>
            <p className="mb-6">
              Features may change as the platform improves.
            </p>

            <LegalHeading>7. Contact</LegalHeading>
            <p className="mb-6">
              Reach club administrators for any concerns.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
