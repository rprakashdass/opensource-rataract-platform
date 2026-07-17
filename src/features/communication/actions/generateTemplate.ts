"use server";

import { getCurrentClub } from "@/lib/club";

/**
 * Generates plain-text email drafts per announcement category.
 * Rules: no markdown (emails send as text / get wrapped in the HTML layout),
 * never print placeholder tokens — omit lines whose data is missing,
 * and sign with the actual club name.
 */
export async function generateTemplate(data: {
  type: string;
  title?: string;
  date?: string;
  location?: string;
  link?: string;
}) {
  const club = await getCurrentClub().catch(() => null);
  const clubName = club?.name || "Our Rotaract Club";

  const title = data.title?.trim();
  const formattedDate = data.date
    ? new Date(data.date).toLocaleString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
      })
    : null;
  const venue = data.location?.trim() || null;
  const link = data.link?.trim() || null;

  // Only lines whose data actually exists — never bracketed placeholders.
  const detailLines = [
    title && `Topic: ${title}`,
    formattedDate && `Date & time: ${formattedDate}`,
    venue && `Venue: ${venue}`,
    link && `Join online: ${link}`,
  ].filter(Boolean);
  const details = detailLines.length > 0 ? `\n${detailLines.join("\n")}\n` : "";

  const signOff = (role: string) => `\nYours in Rotaract,\n${role}\n${clubName}`;

  let emailSubject = "";
  let emailBody = "";
  let agendaContent = "";

  if (data.type === "BOARD_MEETING") {
    emailSubject = title ? `Board Meeting Notice — ${title}` : "Board Meeting Notice";
    emailBody = `Dear Board Members,

You are cordially invited to our upcoming board meeting.
${details}
Please review the agenda and come prepared with updates from your avenues.
${signOff("Secretary")}`;
    agendaContent = `Agenda${title ? ` — ${title}` : ""}

1. Call to order
2. Roll call and apologies
3. Review and approval of previous minutes
4. President's remarks
5. Avenue and portfolio updates
6. Special agenda discussions
7. Any other business
8. Adjournment`;
  } else if (data.type === "CLUB_MEETING") {
    emailSubject = title ? `Club Meeting — ${title}` : "Club Meeting Notice";
    emailBody = `Dear Members,

Please join us for our upcoming general body meeting.
${details}
Looking forward to seeing you all there.
${signOff("Joint Secretary")}`;
    agendaContent = `Agenda

1. Fellowship and welcome
2. Project updates
3. Financial highlights
4. Upcoming plans
5. Member spotlight`;
  } else if (data.type === "EVENT_UPDATE") {
    emailSubject = title ? `Event Update — ${title}` : "Event Update";
    emailBody = `Dear Members and Partners,

We have an update on our upcoming event${title ? `: ${title}` : ""}.
${details}
Please RSVP and help spread the word.
${signOff("Event Committee")}`;
  } else if (data.type === "FINANCE_NOTICE") {
    emailSubject = title ? `Finance Notice — ${title}` : "Finance Notice";
    emailBody = `Dear Members,

Please take note of this financial notice${title ? `: ${title}` : ""}.
${details}
Kindly review the details and clear any dues or payments by the deadline.
${signOff("Treasurer")}`;
  } else if (data.type === "IMPORTANT_NOTICE") {
    emailSubject = title ? `Important Notice — ${title}` : "Important Notice";
    emailBody = `Dear Members,

Please read this important notice${title ? ` regarding ${title}` : ""}.
${details}
Do go through the attached details and respond if action is needed.
${signOff("President")}`;
  } else {
    emailSubject = title ? `${clubName} — ${title}` : `Update from ${clubName}`;
    emailBody = `Dear Members,

Here is an update on our club activities${title ? `: ${title}` : ""}.
${details}
Thank you for your active participation.
${signOff(clubName)}`;
  }

  return { emailSubject, emailBody, agendaContent };
}
