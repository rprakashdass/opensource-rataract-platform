import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import AboutEditorForm from "./_components/AboutEditorForm";

export default async function AboutEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/admin/website" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">About Page Editor</h1>
            <p className="text-slate-500 mt-0.5 text-sm">Manage your club's story, mission, and history.</p>
          </div>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <AboutEditorForm settings={settings} club={club} />
      </div>
    </div>
  );
}

