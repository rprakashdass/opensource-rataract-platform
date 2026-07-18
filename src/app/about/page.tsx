import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getPublicMilestones } from "@/features/public/queries/getPublicMilestones";
import AboutClient from "./AboutClient";

export const revalidate = 300;

import { draftMode } from "next/headers";
export default async function AboutPage() {
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  const club = await getCurrentClub();
  if (!club) notFound();

  const [settings, milestonesData, portfolios] = await Promise.all([
    prisma.websiteSettings.findUnique({ where: { clubId: club.id } }),
    getPublicMilestones(),
    prisma.portfolio.findMany({
      where: { clubId: club.id, isActive: true },
      orderBy: { displayOrder: "asc" }
    })
  ]);

  const milestones = (milestonesData as any).milestones || [];

  const data = {
    club: {
      id: club.id,
      name: club.name,
      shortName: club.shortName ?? undefined,
      aboutTitle: (club as any).aboutTitle ?? undefined,
      aboutSubtitle: (club as any).aboutSubtitle ?? undefined,
      missionStatement: club.missionStatement ?? undefined,
      visionStatement: club.visionStatement ?? undefined,
      aboutStory: (club as any).aboutStory ?? undefined,
      history: (club as any).history ?? undefined,
      parentClubName: (club as any).parentClubName ?? undefined,
      parentClubDescription: (club as any).parentClubDescription ?? undefined,
      district: club.district ?? undefined,
      city: club.city ?? undefined,
      tenureYear: club.tenureYear,
      foundedYear: (club as any).foundedYear ?? undefined,
    },
    settings: {
      aboutEyebrow: settings?.aboutEyebrow ?? undefined,
      aboutStory: settings?.aboutStory ?? undefined,
      aboutPhoto: settings?.aboutPhoto ?? undefined,
      missionQuote: settings?.missionQuote ?? undefined,
      visionQuote: settings?.visionQuote ?? undefined,
      valuesQuote: settings?.valuesQuote ?? undefined,
    },
    milestones: milestones.map((m: any) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      year: m.year,
    })),
    portfolios: portfolios.map(p => ({
      id: p.id,
      name: p.name,
      icon: p.icon,
      description: p.description,
      activities: (p.activities as string[]) || [],
    }))
  };

  return <AboutClient data={data} isPreview={isPreview} />;
}

