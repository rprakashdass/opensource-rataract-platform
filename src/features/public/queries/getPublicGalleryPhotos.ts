import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { unstable_cache } from "next/cache";

const getCachedGalleryPhotos = unstable_cache(
    async () => {
        const club = await getCurrentClub();
        if (!club) return null;

        const settings = await prisma.websiteSettings.findUnique({
            where: { clubId: club.id },
            select: {
                galleryTitle: true,
                gallerySubtitle: true,
                galleryCTA: true,
                galleryCTALink: true,
                galleryAlbumId: true,
            },
        });

        if (!settings?.galleryAlbumId) {
            return { photos: [], settings };
        }

        const photos = await prisma.media.findMany({
            where: { clubId: club.id, albumId: settings.galleryAlbumId, type: "IMAGE" },
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            select: {
                id: true,
                url: true,
                title: true,
                createdAt: true,
                event: { select: { title: true } },
                project: { select: { title: true } },
            },
        });

        return { photos, settings };
    },
    ["public-gallery-photos"],
    { tags: ["gallery", "website-settings"], revalidate: 3600 }
);

export async function getPublicGalleryPhotos() {
    try {
        const data = await getCachedGalleryPhotos();
        if (!data) return { error: "Club not initialized" };
        return data;
    } catch (error: any) {
        console.error("Failed to fetch public gallery:", error);
        return { error: "Failed to load gallery" };
    }
}
