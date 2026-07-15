import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { format } from "date-fns";
import { Paperclip, Calendar as CalendarIcon, MapPin } from "lucide-react";
import {
  RevealBlock,
  Eyebrow,
  EmptyState,
} from "@/components/ui/public/v2";

export default async function PublicAnnouncementsPage() {
  const club = await getCurrentClub();
  if (!club) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6 bg-paper">
        <p className="text-center text-ink-faint font-medium">Loading...</p>
      </main>
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
    <main className="min-h-screen bg-paper pb-24">
      {/* Compact hero */}
      <section className="pt-40 md:pt-48 pb-14 md:pb-20 bg-paper">
        <MaxWidthWrapper>
          <RevealBlock>
            <Eyebrow className="mb-5">Notice board</Eyebrow>
            <h1 className="font-display font-medium text-ink tracking-[-0.015em] leading-[1.05] text-[clamp(2.4rem,5.5vw,4rem)] text-balance max-w-3xl">
              What the board wants you to know.
            </h1>
            <p className="mt-6 text-lg text-ink-soft leading-relaxed max-w-xl">
              Official notices, meeting notifications, volunteer opportunities, and achievements from our board.
            </p>
          </RevealBlock>
        </MaxWidthWrapper>
      </section>

      <section className="py-20 md:py-28 bg-paper border-t border-hairline">
        <MaxWidthWrapper>
          <div className="max-w-3xl">
            {announcements.length > 0 ? (
              <RevealBlock>
                <div className="border-t border-hairline">
                  {announcements.map((announcement) => (
                    <article
                      key={announcement.id}
                      className="grid grid-cols-[64px_1fr] gap-x-5 md:gap-x-8 py-8 border-b border-hairline"
                    >
                      <div className="text-center">
                        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ochre-deep">
                          {format(new Date(announcement.createdAt), "MMM")}
                        </span>
                        <span className="block font-display font-medium text-2xl md:text-3xl text-ink leading-none mt-1 tabular-nums">
                          {format(new Date(announcement.createdAt), "d")}
                        </span>
                        <span className="block text-[11px] font-medium text-ink-faint mt-1 tabular-nums">
                          {format(new Date(announcement.createdAt), "yyyy")}
                        </span>
                      </div>

                      <div className="min-w-0 space-y-4">
                        <div>
                          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-faint mb-1.5">
                            {announcement.type.replace(/_/g, " ").toLowerCase()}
                          </span>
                          <h2 className="font-display font-medium text-xl md:text-2xl text-ink leading-snug text-balance">
                            {announcement.title}
                          </h2>
                        </div>

                        {announcement.description && (
                          <p className="text-[15px] text-ink-soft leading-relaxed">
                            {announcement.description}
                          </p>
                        )}

                        {announcement.startDate && (
                          <div className="bg-wash rounded-xl p-5 text-sm flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-2.5">
                              <CalendarIcon className="w-4 h-4 text-ochre-deep shrink-0" aria-hidden="true" />
                              <div>
                                <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                                  Schedule
                                </span>
                                <span className="text-ink font-medium">
                                  {format(new Date(announcement.startDate), "PPP p")}
                                </span>
                              </div>
                            </div>
                            {announcement.location && (
                              <div className="flex items-center gap-2.5 sm:border-l sm:border-hairline sm:pl-4">
                                <MapPin className="w-4 h-4 text-ochre-deep shrink-0" aria-hidden="true" />
                                <div>
                                  <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-faint">
                                    Venue
                                  </span>
                                  <span className="text-ink font-medium">
                                    {announcement.location}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {announcement.agendaContent && (
                          <div className="pt-4 border-t border-hairline text-[15px] text-ink-soft leading-relaxed max-w-none [&_h1]:font-display [&_h1]:font-medium [&_h1]:text-ink [&_h2]:font-display [&_h2]:font-medium [&_h2]:text-ink [&_h3]:font-display [&_h3]:font-medium [&_h3]:text-ink [&_a]:text-trail [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:mb-3">
                            <div dangerouslySetInnerHTML={{ __html: announcement.agendaContent }} />
                          </div>
                        )}

                        {(announcement.agendaUrl || (announcement.attachments && announcement.attachments.length > 0)) && (
                          <div className="pt-4 border-t border-hairline flex flex-wrap gap-x-8 gap-y-3">
                            {announcement.agendaUrl && (
                              <a
                                href={announcement.agendaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="thadam-link inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-ochre-deep" aria-hidden="true" />
                                View attachment →
                              </a>
                            )}
                            {announcement.attachments?.map((attachment, idx) => (
                              <a
                                key={idx}
                                href={attachment}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="thadam-link inline-flex items-center gap-1.5 text-sm font-semibold text-ink"
                              >
                                <Paperclip className="w-3.5 h-3.5 text-ochre-deep" aria-hidden="true" />
                                Attachment {idx + 1} →
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              </RevealBlock>
            ) : (
              <EmptyState
                title="The board is quiet for now."
                detail="Pins, notices, and updates from the secretaries will appear here the moment they're published."
              />
            )}
          </div>
        </MaxWidthWrapper>
      </section>
    </main>
  );
}
