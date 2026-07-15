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

export default function PrivacyPolicyPage() {
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
              Privacy Policy
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
            <LegalHeading>1. About This Platform</LegalHeading>
            <p className="mb-6">
              This platform is used by Rotaract Clubs to manage members,
              events, projects, communication, and club activities.
            </p>

            <LegalHeading>2. Information We Collect</LegalHeading>
            <p className="mb-4">We may collect:</p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>Name</li>
              <li>Email</li>
              <li>Phone number</li>
              <li>Profile information</li>
              <li>Event participation data</li>
              <li>Uploaded photos/media</li>
            </ul>

            <LegalHeading>3. How Information Is Used</LegalHeading>
            <p className="mb-4">Information is used for:</p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>Club administration</li>
              <li>Event communication</li>
              <li>Attendance tracking</li>
              <li>Membership management</li>
              <li>Sharing club memories</li>
            </ul>

            <LegalHeading>4. Photos & Media</LegalHeading>
            <p className="mb-2">
              Photos uploaded during events may be reviewed by club admins
              before appearing publicly.
            </p>
            <p className="mb-6">
              Members can request removal of their photos.
            </p>

            <LegalHeading>5. Data Access</LegalHeading>
            <p className="mb-6">
              Only authorized club administrators can access internal member data.
            </p>

            <LegalHeading>6. Third Party Services</LegalHeading>
            <p className="mb-4">We may use trusted services including:</p>
            <ul className="list-disc pl-5 mb-6 space-y-1">
              <li>Google Drive for media storage</li>
              <li>Email providers for communication</li>
            </ul>

            <LegalHeading>7. Contact</LegalHeading>
            <p className="mb-6">
              For privacy concerns, contact the club administrators.
            </p>
          </div>
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
