import { prisma } from "@/lib/prisma";
import AnnouncementForm from "../AnnouncementForm";

export default async function NewAnnouncementPage() {
  // Assume a single club for now, or get the first one
  const club = await prisma.club.findFirst();
  
  if (!club) {
    return <div>No club found. Please create a club first.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Announcement</h1>
        <AnnouncementForm clubId={club.id} />
      </div>
    </div>
  );
}
