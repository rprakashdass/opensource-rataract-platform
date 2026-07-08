import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Paperclip, Calendar as CalendarIcon, MapPin } from "lucide-react";
import Link from "next/link";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

export default async function PublicAnnouncementsPage() {
  const club = await getCurrentClub();
  if (!club) {
    return <div className="p-20 text-center">Loading...</div>;
  }

  const announcements = await prisma.announcement.findMany({
    where: {
      clubId: club.id,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      // Specifically hide internal/board-only types just in case
      type: {
        notIn: ["BOARD_MEETING", "CLUB_MEETING"]
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Noticeboard"
        title="Club Announcements"
        description="Stay updated with the latest news, official statements, and important notices from our board."
      />
      <PublicSection background="white">
        <div className="py-8">
          {announcements.length > 0 ? (
            <div className="max-w-4xl space-y-8 relative mx-auto">
              <div className="absolute left-8 top-0 bottom-0 w-px bg-slate-200 hidden md:block" />
              
              {announcements.map((announcement) => (
                <div key={announcement.id} className="relative md:pl-20">
                  <div className="absolute left-[31px] top-6 w-3 h-3 bg-amber-500 rounded-full ring-4 ring-white hidden md:block" />
                  
                  <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8 md:p-10 hover:shadow-md transition-shadow">
                    <div className="flex flex-wrap gap-3 items-center mb-6 border-b border-slate-100 pb-6">
                      <Badge className="bg-amber-100 text-amber-800 border-none px-3 py-1 text-xs uppercase tracking-wider font-bold shadow-sm">
                        {announcement.type.replace(/_/g, " ")}
                      </Badge>
                      <span className="text-sm text-slate-400 font-bold uppercase tracking-wider">
                        {format(new Date(announcement.createdAt), "MMMM d, yyyy")}
                      </span>
                    </div>
                  
                  <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4">{announcement.title}</h2>
                  
                  {announcement.description && (
                    <p className="text-slate-600 mb-8 leading-relaxed font-medium">
                      {announcement.description}
                    </p>
                  )}

                  {announcement.startDate && (
                    <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100 flex flex-col sm:flex-row sm:items-center gap-6 text-slate-700">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                          <CalendarIcon className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                          <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Date & Time</span>
                          <span className="font-bold text-slate-900">{format(new Date(announcement.startDate), "PPP p")}</span>
                        </div>
                      </div>
                      {announcement.location && (
                        <div className="flex items-center gap-3 sm:border-l sm:border-slate-200 sm:pl-6">
                          <div className="bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
                            <MapPin className="w-5 h-5 text-amber-500" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-slate-400">Location</span>
                            <span className="font-bold text-slate-900">{announcement.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {announcement.agendaContent && (
                    <div className="prose prose-slate max-w-none mt-6 prose-a:text-amber-600 font-medium">
                      <div dangerouslySetInnerHTML={{ __html: announcement.agendaContent }} />
                    </div>
                  )}
                  
                  {(announcement.agendaUrl || (announcement.attachments && announcement.attachments.length > 0)) && (
                    <div className="mt-8 pt-8 border-t border-slate-100 flex flex-wrap gap-4">
                      {announcement.agendaUrl && (
                        <a 
                          href={announcement.agendaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                        >
                          <Paperclip className="w-4 h-4 text-amber-500" /> View Attachment
                        </a>
                      )}
                      {announcement.attachments?.map((attachment, idx) => (
                        <a 
                          key={idx}
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 transition-all shadow-sm"
                        >
                          <Paperclip className="w-4 h-4 text-amber-500" /> File {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 max-w-3xl mx-auto">
            <Megaphone className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-2xl font-black text-slate-900 mb-2">Notice Board is Empty</h3>
            <p className="text-slate-500 font-medium">Check back later for public updates from the club.</p>
          </div>
          )}
        </div>
      </PublicSection>
    </main>
  );
}
