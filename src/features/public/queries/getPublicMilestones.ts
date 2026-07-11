import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedPublicMilestones = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        const [milestones, settings] = await Promise.all([
            prisma.milestone.findMany({
                where: { clubId: club.id },
                orderBy: [{ year: "desc" }, { displayOrder: "asc" }],
            }),
            prisma.websiteSettings.findUnique({
                where: { clubId: club.id },
                select: { archiveTitle: true, archiveSubtitle: true },
            }),
        ]);

        return { milestones, settings };
    },
    ["public-milestones"],
    { tags: ["milestones", "website-settings"], revalidate: 3600 }
);

export async function getPublicMilestones() {
    try {
        const data = await getCachedPublicMilestones();
        if (!data) return { error: "Club not initialized" };
        return data;
    } catch (error: any) {
        console.error("Failed to fetch public milestones:", error);
        return { error: "Failed to load milestones" };
    }
}
