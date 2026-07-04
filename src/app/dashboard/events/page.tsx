import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import Link from "next/link";

import { redirect } from "next/navigation";

export default async function MemberEventsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  const member = await prisma.member.findUnique({
    where: { userId: session.id },
    include: {
      eventAttendees: {
        include: { event: true },
        orderBy: { registeredAt: "desc" }
      }
    }
  });

  if (!member) {
    return <div className="p-8">Member profile not found.</div>;
  }

  const registrations = member.eventAttendees;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-700 to-pink-600">
            My Events
          </h1>
          <p className="text-base text-gray-500 max-w-2xl">
            View all the events and initiatives you have registered for or attended.
          </p>
        </div>
        <Link 
          href="/events" 
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
        >
          Browse Upcoming Events
          <ExternalLink className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registrations.length === 0 ? (
          <div className="col-span-full bg-white border border-gray-200/60 rounded-2xl p-12 text-center shadow-sm">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
            <p className="text-gray-500">You haven't registered for any events yet.</p>
          </div>
        ) : (
          registrations.map((reg) => (
            <div key={reg.id} className="bg-white rounded-2xl border border-gray-200/60 shadow-xl shadow-gray-900/5 overflow-hidden flex flex-col hover:border-purple-200 transition-colors">
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-md
                    ${reg.attendedAt ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {reg.attendedAt ? 'Attended' : 'Registered'}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    {new Date(reg.registeredAt).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2">
                  {reg.event.title}
                </h3>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <Calendar className="h-4 w-4 text-purple-500" />
                    <span>{new Date(reg.event.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 gap-2">
                    <MapPin className="h-4 w-4 text-purple-500" />
                    <span className="truncate">{reg.event.location}</span>
                  </div>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Link href={`/events/${reg.event.slug}`} className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition">
                  View Event Details &rarr;
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
