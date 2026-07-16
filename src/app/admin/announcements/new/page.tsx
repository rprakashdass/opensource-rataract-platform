import { prisma } from "@/lib/prisma";
import AnnouncementForm from "../AnnouncementForm";
import { PageHeader } from "@/components/portal";

export default async function NewAnnouncementPage() {
  // Assume a single club for now, or get the first one
  const club = await prisma.club.findFirst();
  
  if (!club) {
    return <div>No club found. Please create a club first.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Create New Announcement" backHref="/admin/announcements" backLabel="Back to Announcements" />
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <AnnouncementForm clubId={club.id} />
      </div>
    </div>
  );
}
