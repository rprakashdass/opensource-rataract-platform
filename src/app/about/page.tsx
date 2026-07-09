import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const [settings, milestones, portfolios] = await Promise.all([
    prisma.websiteSettings.findUnique({ where: { clubId: club.id } }),
    prisma.milestone.findMany({
      where: { clubId: club.id },
      orderBy: [{ year: "desc" }, { displayOrder: "asc" }]
    }),
    prisma.portfolio.findMany({
      where: { clubId: club.id, isActive: true },
      orderBy: { displayOrder: "asc" }
    })
  ]);

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
    },
    settings: {
      aboutStory: settings?.aboutStory,
    },
    milestones: milestones.map(m => ({
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

  return <AboutClient data={data} />;
}

