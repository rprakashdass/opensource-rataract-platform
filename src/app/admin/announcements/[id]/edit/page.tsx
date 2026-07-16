import { prisma } from "@/lib/prisma";
import AnnouncementForm from "../../AnnouncementForm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/portal";

export default async function EditAnnouncementPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const announcement = await prisma.announcement.findUnique({
    where: { id },
  });

  if (!announcement) {
    notFound();
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <PageHeader title="Edit Announcement" backHref={`/admin/announcements/${id}`} backLabel="Back to Announcement" />
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <AnnouncementForm initialData={announcement} clubId={announcement.clubId} />
      </div>
    </div>
  );
}
