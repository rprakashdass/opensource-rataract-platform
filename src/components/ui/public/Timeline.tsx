import Link from "next/link";
import { Clock, MapPin, ChevronRight, Calendar } from "lucide-react";

interface TimelineEvent {
  id: string;
  slug: string;
  title: string;
  startDate: Date | string;
  startTime: Date | string | null;
  location: string | null;
}

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200">
        <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">No upcoming events scheduled right now.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => {
        const eventDate = new Date(event.startDate);
        return (
          <Link href={`/events/${event.slug}`} key={event.id} className="group flex bg-white rounded-2xl p-4 border border-slate-200 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/5 transition-all duration-300">
            <div className="flex flex-col items-center justify-center bg-slate-50 rounded-xl w-20 h-20 shrink-0 border border-slate-100 shadow-sm group-hover:bg-amber-50 transition-colors">
              <span className="text-sm font-bold text-amber-600 uppercase tracking-wider">{eventDate.toLocaleString('default', { month: 'short' })}</span>
              <span className="text-2xl font-black text-slate-900 leading-none">{eventDate.getDate()}</span>
            </div>
            <div className="ml-4 flex flex-col justify-center flex-1">
              <h3 className="font-bold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">{event.title}</h3>
              <div className="flex flex-wrap items-center text-sm text-slate-500 mt-1 gap-x-4 gap-y-1">
                <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "TBA"}</span>
                <span className="flex items-center line-clamp-1"><MapPin className="w-3.5 h-3.5 mr-1 shrink-0" />{event.location || "TBA"}</span>
              </div>
            </div>
            <div className="flex items-center justify-center pl-2">
              <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-amber-500 transition-colors" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
