import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import GalleryEditorForm from "./_components/GalleryEditorForm";

export default async function GalleryEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const [settings, albums] = await Promise.all([
    getOrCreateWebsiteSettings(club.id),
    prisma.album.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <PageHeader
        title="Gallery Page Editor"
        description="Manage the public Gallery page copy and the homepage photo teaser."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4 shrink-0"
      />

      <div className="flex-1 min-h-0">
        <GalleryEditorForm settings={settings} albums={albums} />
      </div>
    </div>
  );
}
