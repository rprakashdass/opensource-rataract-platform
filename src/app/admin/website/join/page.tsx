import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import JoinEditorForm from "./_components/JoinEditorForm";

export default async function JoinEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <PageHeader
        title="Join Page Editor"
        description='Manage the copy shown on the "Join Us" page.'
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4 shrink-0"
      />

      <div className="flex-1 min-h-0">
        <JoinEditorForm settings={settings} clubName={club.name} />
      </div>
    </div>
  );
}
