import { getCurrentClub } from "@/lib/club";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import AboutClient from "./AboutClient";

export default async function AboutPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await prisma.websiteSettings.findUnique({
    where: { clubId: club.id }
  });

  const milestones = await prisma.milestone.findMany({
    where: { clubId: club.id },
    orderBy: [{ year: "desc" }, { displayOrder: "asc" }]
  });

  // Serialize the data to pass to the client component
  const data = {
    club: {
      id: club.id,
      name: club.name,
      missionStatement: club.missionStatement,
      district: club.district,
      city: club.city,
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
    }))
  };

  return <AboutClient data={data} />;
}

