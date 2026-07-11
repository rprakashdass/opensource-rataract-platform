import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Megaphone, Paperclip, Calendar as CalendarIcon, MapPin, Sparkles } from "lucide-react";
import Link from "next/link";
import { PageHero } from "@/components/ui/public/PageHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

export default async function PublicAnnouncementsPage() {
  const club = await getCurrentClub();
  if (!club) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-[#FAF9F6]">
        <div className="text-center text-slate-500 font-medium">Loading...</div>
      </div>
    );
  }

  const announcements = await prisma.announcement.findMany({
    where: {
      clubId: club.id,
      status: "PUBLISHED",
      visibility: "PUBLIC",
      type: {
        notIn: ["BOARD_MEETING", "CLUB_MEETING"]
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#FAF9F6] pb-24">
      <PageHero 
        eyebrow="Notice Board"
        title="Club Notice Board"
        subtitle="Official notices, meeting notifications, volunteer opportunities, and achievements from our board."
      />
      <PublicSection background="white">
        <div className="py-6 max-w-3xl mx-auto">
          {announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className="bg-white rounded-2xl border border-slate-200/60 shadow-sm p-6 md:p-8 space-y-4 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-100 pb-4">
                    <Badge className="bg-primary text-white border-none px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                      {announcement.type.replace(/_/g, " ")}
                    </Badge>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-wider">
                      Pinned: {format(new Date(announcement.createdAt), "MMMM d, yyyy")}
                    </span>
                  </div>
                
                  <h2 className="text-xl md:text-2xl font-black text-[#0B132B] leading-tight">
                    {announcement.title}
                  </h2>
                  
                  {announcement.description && (
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed font-medium">
                      {announcement.description}
                    </p>
                  )}

                  {announcement.startDate && (
                    <div className="bg-[#FAF9F6] rounded-xl p-4 border border-slate-200/40 flex flex-col sm:flex-row sm:items-center gap-4 text-xs font-semibold text-slate-600">
                      <div className="flex items-center gap-2.5">
                        <div className="bg-white p-2 rounded-lg border border-slate-200/40 text-primary">
                          <CalendarIcon className="w-4.5 h-4.5" />
                        </div>
                        <div>
                          <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Schedule</span>
                          <span className="text-slate-800 font-bold">{format(new Date(announcement.startDate), "PPP p")}</span>
                        </div>
                      </div>
                      {announcement.location && (
                        <div className="flex items-center gap-2.5 sm:border-l sm:border-slate-200 sm:pl-4">
                          <div className="bg-white p-2 rounded-lg border border-slate-200/40 text-primary">
                            <MapPin className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <span className="block text-[9px] font-bold uppercase tracking-wider text-slate-400">Venue</span>
                            <span className="text-slate-800 font-bold leading-none">{announcement.location}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {announcement.agendaContent && (
                    <div className="prose prose-slate max-w-none text-slate-600 text-sm leading-relaxed border-t border-slate-100 pt-4 font-medium">
                      <div dangerouslySetInnerHTML={{ __html: announcement.agendaContent }} />
                    </div>
                  )}
                  
                  {(announcement.agendaUrl || (announcement.attachments && announcement.attachments.length > 0)) && (
                    <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-3">
                      {announcement.agendaUrl && (
                        <a 
                          href={announcement.agendaUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-xs text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:text-secondary hover:border-slate-300 transition-all shadow-sm"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-primary" /> View Attachment
                        </a>
                      )}
                      {announcement.attachments?.map((attachment, idx) => (
                        <a 
                          key={idx}
                          href={attachment} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 text-xs text-slate-700 font-bold rounded-lg hover:bg-slate-50 hover:text-secondary hover:border-slate-300 transition-all shadow-sm"
                        >
                          <Paperclip className="w-3.5 h-3.5 text-primary" /> Attachment {idx + 1}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-16 text-center border border-slate-200/60 max-w-2xl mx-auto shadow-sm">
              <Megaphone className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-black text-[#0B132B] mb-2">Every great journey starts somewhere.</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed">
                Your first pins and board updates will appear here once published by the secretaries.
              </p>
            </div>
          )}
        </div>
      </PublicSection>
    </main>
  );
}
