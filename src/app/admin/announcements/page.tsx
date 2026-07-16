import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { Calendar, MapPin, Video } from "lucide-react";
import DeleteAnnouncementButton from "./DeleteAnnouncementButton";
import FilterBar from "@/components/admin/FilterBar";
import { PageHeader, TableWrap, PortalEmptyState } from "@/components/portal";

export default async function AnnouncementsPage(props: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await props.searchParams;
  const search = searchParams.search || "";
  const month = searchParams.month ? parseInt(searchParams.month) : undefined;
  const year = searchParams.year ? parseInt(searchParams.year) : undefined;
  const status = searchParams.status || "";

  const where: any = {};
  
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);
    where.startDate = { gte: startDate, lt: endDate };
  } else if (year) {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    where.startDate = { gte: startDate, lt: endDate };
  } else if (month) {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, month - 1, 1);
    const endDate = new Date(currentYear, month, 1);
    where.startDate = { gte: startDate, lt: endDate };
  }

  if (status) {
    where.type = status;
  }

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { startDate: "desc" },
  });

  const typeOptions = [
    { label: "Meeting", value: "MEETING" },
    { label: "Event", value: "EVENT" },
    { label: "Update", value: "UPDATE" },
    { label: "Notice", value: "NOTICE" },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <PageHeader
        title="Announcements"
        description="Schedule club meetings, gatherings, and manage attendees."
        actions={
          <Link
            href="/admin/announcements/new"
            className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-deep transition shadow-sm"
          >
            New Announcement
          </Link>
        }
      />

      <FilterBar 
        placeholder="Search announcements..." 
        showMonthFilter 
        showYearFilter
        showStatusFilter
        statusOptions={typeOptions}
      />

      {/* List */}
      {announcements.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200">
          <PortalEmptyState
            title="No Announcements Found"
            detail="Adjust your filters or create a new announcement."
          />
        </div>
      ) : (
        <TableWrap
          mobile={announcements.map((announcement) => (
            <div key={announcement.id} className="p-4 space-y-3">
              <Link href={`/admin/announcements/${announcement.id}`} className="block group">
                <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{announcement.title}</p>
                <p className="text-sm text-slate-500 line-clamp-1 mt-1">{announcement.description || "No description"}</p>
              </Link>
              <div className="flex flex-col gap-1.5">
                {announcement.startDate && (
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                    {format(new Date(announcement.startDate), "MMM d, yyyy h:mm a")}
                  </div>
                )}
                {(announcement.location || announcement.meetingLink) && (
                  <div className="flex items-center text-sm text-slate-500">
                    {announcement.location ? (
                      <><MapPin className="h-4 w-4 mr-2 text-slate-400" /> {announcement.location}</>
                    ) : (
                      <><Video className="h-4 w-4 mr-2 text-slate-400" /> Online Meeting</>
                    )}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                  {announcement.type}
                </span>
                <div className="flex items-center gap-3 text-sm font-medium">
                  <Link
                    href={`/admin/announcements/${announcement.id}/edit`}
                    className="text-brand hover:text-brand-deep"
                  >
                    Edit
                  </Link>
                  <DeleteAnnouncementButton id={announcement.id} />
                </div>
              </div>
            </div>
          ))}
        >
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Details</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Location</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Type & Attendees</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/admin/announcements/${announcement.id}`} className="block group">
                      <p className="text-sm font-bold text-slate-900 group-hover:text-brand transition-colors">{announcement.title}</p>
                      <p className="text-sm text-slate-500 line-clamp-1 mt-1">{announcement.description || "No description"}</p>
                    </Link>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1.5">
                      {announcement.startDate && (
                        <div className="flex items-center text-sm text-slate-600">
                          <Calendar className="h-4 w-4 mr-2 text-slate-400" />
                          {format(new Date(announcement.startDate), "MMM d, yyyy h:mm a")}
                        </div>
                      )}
                      {(announcement.location || announcement.meetingLink) && (
                        <div className="flex items-center text-sm text-slate-500">
                          {announcement.location ? (
                            <><MapPin className="h-4 w-4 mr-2 text-slate-400" /> {announcement.location}</>
                          ) : (
                            <><Video className="h-4 w-4 mr-2 text-slate-400" /> Online Meeting</>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-2">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 w-fit">
                        {announcement.type}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/announcements/${announcement.id}/edit`}
                        className="text-brand hover:text-brand-deep"
                      >
                        Edit
                      </Link>
                      <DeleteAnnouncementButton id={announcement.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableWrap>
      )}
    </div>
  );
}
