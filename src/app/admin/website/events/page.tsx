import { getCurrentClub } from "@/lib/club";
import { getOrCreateWebsiteSettings } from "@/features/public/queries/getOrCreateWebsiteSettings";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";
import EventsEditorForm from "./_components/EventsEditorForm";

export default async function EventsEditorPage() {
  const club = await getCurrentClub();
  if (!club) notFound();

  const settings = await getOrCreateWebsiteSettings(club.id);

  return (
    <div className="w-full h-full px-4 md:px-8 py-6 flex flex-col">
      <PageHeader
        title="Events Page Editor"
        description="Manage the copy shown on the public Events page."
        backHref="/admin/website"
        backLabel="Website Control Center"
        className="mb-4 shrink-0"
      />

      <div className="flex-1 min-h-0">
        <EventsEditorForm settings={settings} />
      </div>
    </div>
  );
}
