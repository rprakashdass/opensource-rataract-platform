import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/website" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Gallery Page Editor</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Manage the public Gallery page copy and the homepage photo teaser.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <GalleryEditorForm settings={settings} albums={albums} />
      </div>
    </div>
  );
}
