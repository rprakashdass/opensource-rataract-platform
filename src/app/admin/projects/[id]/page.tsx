import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Users, IndianRupee, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import ProjectSettingsButton from "./_components/ProjectSettingsButton";

export default async function ProjectManagementPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      events: {
        orderBy: { startTime: 'asc' },
        include: { _count: { select: { registrations: true } } }
      },
    }
  });

  if (!project) notFound();

  // Basic stats aggregation
  const totalEvents = project.events.length;
  const totalRegistrations = project.events.reduce((acc, ev) => acc + ev._count.registrations, 0);

  return (
    <div className="max-w-6xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Projects
        </Link>
        <ProjectSettingsButton project={project} />
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-purple-100 text-purple-700 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide">
            {project.category.replace(/_/g, ' ')}
          </span>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wide ${project.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
            {project.status}
          </span>
        </div>
        <h1 className="text-4xl font-bold text-gray-900">{project.title}</h1>
        <p className="text-lg text-gray-500 mt-2 max-w-3xl">{project.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-500" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalEvents} Events</div>
            <p className="text-sm text-gray-500 mt-1">
              {new Date(project.startDate).toLocaleDateString()} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'Ongoing'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-500" />
              Engagement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{totalRegistrations}</div>
            <p className="text-sm text-gray-500 mt-1">Total registrations across all events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-green-500" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">₹ 0</div>
            <p className="text-sm text-gray-500 mt-1">Total project expenses (Coming soon)</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Project Events</h2>
          <Link href={`/admin/events/create?project=${project.id}`}>
            <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4" /> Add Event
            </Button>
          </Link>
        </div>
        
        {project.events.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No events scheduled</h3>
            <p className="text-gray-500 mt-1">Get started by adding the first event to this project.</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-medium border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4">Event Name</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registrations</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {project.events.map(event => (
                  <tr key={event.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{event.title}</td>
                    <td className="px-6 py-4" suppressHydrationWarning>{new Date(event.startTime).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {event.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{event._count.registrations}</td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/events/${event.id}`} className="text-purple-600 font-medium hover:text-purple-800">
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
