import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Calendar, Users } from "lucide-react";
import DeleteButton from "@/components/admin/DeleteButton";

export default async function MeetingsAdminPage() {
  const meetings = await prisma.meeting.findMany({
    orderBy: { date: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-700">Meetings</span>
          <h1 className="text-3xl font-bold text-gray-900">Club Meetings</h1>
          <p className="text-sm text-gray-500 max-w-2xl">
            Schedule club meetings, set agendas, send email invites, and record minutes.
          </p>
        </div>
        <Link href="/admin/meetings/new" className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition">
          Schedule Meeting
        </Link>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        {meetings.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No meetings scheduled yet.
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Meeting Title</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {meetings.map((meeting) => (
                <tr key={meeting.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{meeting.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(meeting.date).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {meeting.location || "TBD"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-3">
                    <Link href={`/admin/meetings/${meeting.id}`} className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 transition">
                      Manage
                    </Link>
                    <DeleteButton endpoint="/api/admin/meetings" id={meeting.id} confirmMessage="Delete this meeting?" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
