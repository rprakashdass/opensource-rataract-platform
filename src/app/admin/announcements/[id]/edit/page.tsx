import { prisma } from "@/lib/prisma";
import AnnouncementForm from "../../AnnouncementForm";
import { notFound } from "next/navigation";

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
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Announcement</h1>
        <AnnouncementForm initialData={announcement} clubId={announcement.clubId} />
      </div>
    </div>
  );
}
