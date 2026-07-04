import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  let membersCount = 0;
  let eventsCount = 0;
  let projectsCount = 0;

  try {
    membersCount = await prisma.member.count();
    eventsCount = await prisma.event.count();
    projectsCount = await prisma.project.count();
  } catch (error) {
    console.warn("Prisma dashboard counts failed, DB not connected yet:", error);
  }

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/admin/members" className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-sm mb-2 font-medium">Total Members</p>
          <p className="text-3xl font-bold text-purple-600">{membersCount}</p>
        </Link>
        <Link href="/admin/events" className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-sm mb-2 font-medium">Upcoming Events</p>
          <p className="text-3xl font-bold text-pink-600">{eventsCount}</p>
        </Link>
        <Link href="/admin/projects" className="block bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition">
          <p className="text-gray-600 text-sm mb-2 font-medium">Active Projects</p>
          <p className="text-3xl font-bold text-blue-600">{projectsCount}</p>
        </Link>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-purple-900">
        <h2 className="font-semibold mb-2">🚀 Welcome to your Club CRM</h2>
        <p>This panel allows you to upload members, events, and projects directly to your database. Select a tab from the sidebar or click one of the panels above to start uploading data!</p>
      </div>
    </div>
  );
}
