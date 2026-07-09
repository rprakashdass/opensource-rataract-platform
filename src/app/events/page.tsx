import { getPublicEvents } from "@/features/public/queries/getPublicEvents";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";
import { PublicCard } from "@/components/ui/public/PublicCard";
import { Calendar, Clock, MapPin } from "lucide-react";
import React from "react";

export default async function EventsPage() {
  const data = await getPublicEvents();

  if (data.error) {
    return <div className="p-20 text-center text-slate-500">Failed to load events.</div>;
  }

  const upcomingEvents = data.upcomingEvents || [];
  const completedEvents = data.completedEvents || [];

  return (
    <main className="min-h-screen bg-white flex flex-col">
      <PublicHero 
        badge="Join Us"
        title="Events Calendar"
        description="Discover upcoming opportunities to volunteer, network, and grow with our Rotaract community."
      />

      {/* Upcoming Events */}
      <PublicSection title="Upcoming Events" background="white">
        {upcomingEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingEvents.map((event: any) => {
              const eventDate = new Date(event.startDate);
              const poster = event.media?.find((m: any) => m.id === event.bannerMediaId) || event.media?.[0];
              const imageUrl = poster?.url || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800";
              
              const MetaData = (
                <div className="flex gap-4 items-center">
                  <span className="text-primary font-black">{eventDate.toLocaleDateString('default', { month: 'short', day: 'numeric' })}</span>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-500">{event.type}</span>
                </div>
              );

              const FooterData = (
                <div className="flex flex-col gap-2 text-slate-500">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    {event.startTime ? new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "Time TBA"}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span className="line-clamp-1">{event.location || "Venue TBA"}</span>
                  </div>
                </div>
              );
              
              return (
                <PublicCard 
                  key={event.id}
                  title={event.title}
                  description={event.description || "No description provided."}
                  imageUrl={imageUrl}
                  href={`/events/${event.slug}`}
                  badge={event.type}
                  meta={MetaData}
                  footer={FooterData}
                />
              );
            })}
          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">No upcoming events are scheduled right now.</p>
          </div>
        )}
      </PublicSection>

      {/* Past Events */}
      <PublicSection title="Recent Past Events" background="slate">
        {completedEvents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {completedEvents.map((event: any) => {
              const poster = event.media?.find((m: any) => m.id === event.bannerMediaId) || event.media?.[0];
              const imageUrl = poster?.url || "https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800";
              
              return (
                <PublicCard 
                  key={event.id}
                  title={event.title}
                  description={event.description || ""}
                  imageUrl={imageUrl}
                  href={`/events/${event.slug}`}
                  meta={new Date(event.startDate).toLocaleDateString()}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-slate-500 font-medium">No past events recorded.</div>
        )}
      </PublicSection>
    </main>
  );
}

