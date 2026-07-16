import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import AboutEditorForm from "./_components/AboutEditorForm";

export default async function AboutEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <PageHeader
        title="About Page Editor"
        description="Manage your club's story, mission, and history."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4 shrink-0"
      />

      <div className="flex-1 min-h-0">
        <AboutEditorForm settings={settings} club={club} />
      </div>
    </div>
  );
}

