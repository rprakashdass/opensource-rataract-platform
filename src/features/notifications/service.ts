import { NotificationTrigger } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import * as ics from "ics";
import { getAnnouncementHtml, getEventInviteEmailHtml, getNotificationEmailHtml } from "@/lib/email-templates";
import { generateTemplate } from "@/features/communication/actions/generateTemplate";
import { getSupabaseAdmin } from "@/lib/db/supabase";

interface DispatchOptions {
  trigger: NotificationTrigger;
  recipients: string[];
  eventId?: string;
  announcementId?: string;
  sendEmailFlag?: boolean;
  attachCalendarFlag?: boolean;
}

export async function dispatchNotification(opts: DispatchOptions) {
  const { trigger, recipients, eventId, announcementId, sendEmailFlag = true, attachCalendarFlag = false } = opts;

  if (!recipients.length) return;
  if (!sendEmailFlag && !attachCalendarFlag) return;

  const club = await prisma.club.findFirst();
  const primaryColor = club?.primaryColor || "#D41367";
  const clubName = club?.name || "Rotaract Club";

  let subject = "";
  let body = "";
  let attachments: any[] = [];
  
  let headerTitle = "Club Update";
  let event: any = null;
  let ann: any = null;
  let googleCalUrl = "";
  let dateStr = "";
  let timeStr = "";
  let fallbackAttachmentsHtml = "";
  
  // 1. Fetch Context
  if (eventId) {
    event = await prisma.event.findUnique({ where: { id: eventId }, include: { club: true } });
    if (event) {
      subject = `Event Update: ${event.title}`;
      body = `<p>Hi there,</p><p>We have a new update regarding <strong>${event.title}</strong>.</p>`;
      
      if (trigger === "EVENT_CREATED") {
        headerTitle = "Event Invitation";
        subject = `[Invitation] ${event.title}`;
        
        const start = new Date(event.startDate);
        dateStr = start.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        timeStr = start.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const eventUrl = `${appUrl}/events/${event.slug}`;
        
        // Generate Google Calendar Link
        const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
        const formatForGoogle = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForGoogle(start)}/${formatForGoogle(end)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || event.meetingLink || "")}`;

        body = `
          <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1f2937;">Hi {{memberName}},</p>
          <p style="font-size: 15px; margin-bottom: 24px; color: #4b5563; line-height: 1.6;">You are cordially invited to attend our upcoming event: <strong>${event.title}</strong>. Here are the details:</p>
          
          <div style="background-color: ${primaryColor}08; border: 1px solid ${primaryColor}22; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: ${primaryColor}; width: 100px; vertical-align: top;">Date:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: ${primaryColor}; vertical-align: top;">Time:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${timeStr}</td>
              </tr>
              ${event.location ? `
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: ${primaryColor}; vertical-align: top;">Location:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${event.location}</td>
              </tr>
              ` : ""}
              ${event.meetingLink ? `
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: ${primaryColor}; vertical-align: top;">Online Link:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937;"><a href="${event.meetingLink}" style="color: ${primaryColor}; font-weight: bold; text-decoration: underline;">Join Online Meeting</a></td>
              </tr>
              ` : ""}
            </table>
          </div>
          
          ${event.description ? `
          <div style="margin-bottom: 28px;">
            <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;">About the Event</h4>
            <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.6; white-space: pre-wrap;">${event.description}</p>
          </div>
          ` : ""}

          <div style="text-align: center; margin: 32px 0 24px 0;">
            <a href="${eventUrl}" style="background-color: ${primaryColor}; color: #ffffff; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block;">
              View Event Details & RSVP
            </a>
          </div>

          <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px;">
            <a href="${googleCalUrl}" target="_blank" rel="noopener noreferrer" style="color: ${primaryColor}; font-size: 12px; font-weight: 700; text-decoration: underline; display: inline-block;">
              + Add to Google Calendar
            </a>
          </div>
        `;
      }
      
      if (trigger === "ATTENDANCE_CONFIRMED") {
        subject = `Registration Confirmed: ${event.title}`;
        body = `<p>Hi {{memberName}},</p><p>Your registration for <strong>${event.title}</strong> has been confirmed.</p><p>We look forward to seeing you there!</p>`;
      }
      
      if (attachCalendarFlag) {
         const icsString = generateIcs(event);
         if (icsString) {
           attachments.push({
             filename: "invite.ics",
             content: icsString,
             contentType: "text/calendar"
           });
         }
      }
    }
  } else if (announcementId) {
    ann = await prisma.announcement.findUnique({ where: { id: announcementId } });
    if (ann) {
      subject = ann.emailSubject || `Notice: ${ann.title}`;
      body = ann.emailBody || `<p>${ann.description}</p>`;
      
      if (attachCalendarFlag && ann.startDate) {
        const icsString = generateIcs({
          title: ann.title,
          description: ann.description,
          location: ann.location,
          meetingLink: ann.meetingLink,
          startDate: ann.startDate,
          endDate: new Date(ann.startDate.getTime() + 60 * 60 * 1000)
        });
        if (icsString) {
          attachments.push({
             filename: "invite.ics",
             content: icsString,
             contentType: "text/calendar"
           });
        }
      }

      // Fetch and attach agenda / minutes / other files
      const fileUrlsToAttach = [
        { url: ann.agendaUrl, defaultName: "Agenda.pdf", label: "Agenda Document" },
        { url: ann.minutesUrl, defaultName: "Minutes.pdf", label: "Meeting Minutes" }
      ];
      
      let fallbackHtmlStr = "";
      
      if (ann.attachments && Array.isArray(ann.attachments)) {
        ann.attachments.forEach((url: string, i: number) => {
          if (url) {
            fileUrlsToAttach.push({ url, defaultName: `Attachment-${i+1}`, label: `Attachment ${i+1}` });
          }
        });
      }

      for (const item of fileUrlsToAttach) {
        if (item.url) {
          const fileData = await fetchAttachment(item.url, item.defaultName);
          if (fileData) {
            if (fileData.size > 10 * 1024 * 1024) {
              console.log(`[Email Service] File ${fileData.filename} is too large (${(fileData.size / (1024 * 1024)).toFixed(2)}MB). Linking instead.`);
              fallbackHtmlStr += `<p style="margin-top: 15px; font-size: 14px;">📎 <strong>${item.label}:</strong> <a href="${item.url}" style="color: ${primaryColor}; text-decoration: underline;">Download ${fileData.filename}</a></p>`;
            } else {
              attachments.push({
                filename: fileData.filename,
                content: fileData.content,
                contentType: fileData.contentType
              });
            }
          } else {
            fallbackHtmlStr += `<p style="margin-top: 15px; font-size: 14px;">📎 <strong>${item.label}:</strong> <a href="${item.url}" style="color: ${primaryColor}; text-decoration: underline;">Download File</a> (Attachment fetch failed)</p>`;
          }
        }
      }
      
      fallbackAttachmentsHtml = fallbackHtmlStr;
      body += fallbackHtmlStr;
    }
  }

  // Fallback defaults
  if (!subject) subject = "Club Notification";
  if (!body) body = "<p>You have a new notification.</p>";

  // 2. Send Emails
  let status = "FAILED";
  let errorMsg = null;
  
if (sendEmailFlag || attachCalendarFlag) {
     try {
       const users = await prisma.user.findMany({
         where: { email: { in: recipients } },
         select: { email: true, name: true }
       });

       const getEmailParts = async (recipientEmail: string, name: string) => {
          let html = "";
          let text = "";
          
          if (announcementId && ann) {
            html = getAnnouncementHtml(ann, club, fallbackAttachmentsHtml);
            const templ = await generateTemplate({
              type: ann.type,
              title: ann.title,
              date: ann.startDate ? ann.startDate.toISOString() : undefined,
              location: ann.location || undefined,
              link: ann.meetingLink || undefined
            });
            text = templ.emailBody;
            if (ann.emailBody) {
              text += `\n\nAdditional Notes:\n${ann.emailBody}`;
            }
          } else if (eventId && event) {
            html = getEventInviteEmailHtml(event, name, club, googleCalUrl);
            const start = new Date(event.startDate);
            const formattedDate = start.toLocaleString("en-US", {
              timeZone: "Asia/Kolkata",
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            }) + " (IST)";
            text = `Hi ${name},\n\nYou are cordially invited to attend our upcoming event: ${event.title}.\n\nDate & Time: ${formattedDate}\nLocation: ${event.location || "TBD"}\nLink: ${event.meetingLink || "None"}\n\nSee you there!`;
          } else {
            const personalBody = body.replace(/{{memberName}}/g, name);
            html = getNotificationEmailHtml(subject, personalBody, name, club);
            text = personalBody.replace(/<[^>]*>/g, ""); // Strip HTML tags
          }
          
          return { html, text };
        };

        for (const u of users) {
          if (!u.email) continue;
          const { html: emailHtml, text: emailText } = await getEmailParts(u.email, u.name || "Member");
          await sendEmail({
            to: u.email,
            subject,
            text: emailText,
            html: emailHtml,
            attachments: attachments.length > 0 ? attachments : undefined
          });
        }
        
        // Handle any recipients that weren't found in the DB (fallback)
        const foundEmails = new Set(users.map(u => u.email));
        const missingRecipients = recipients.filter(r => !foundEmails.has(r));
        if (missingRecipients.length > 0) {
          for (const email of missingRecipients) {
             const { html: emailHtml, text: emailText } = await getEmailParts(email, "Member");
             await sendEmail({
                to: email,
                subject,
                text: emailText,
                html: emailHtml,
                attachments: attachments.length > 0 ? attachments : undefined
             });
          }
        }
        status = "SUCCESS";
     } catch (e: any) {
       errorMsg = e.message;
       console.error("Notification email failed:", e);
     }
  }

  // 3. Log
  await prisma.communicationLog.create({
    data: {
      trigger,
      subject,
      body,
      recipientsCount: recipients.length,
      status,
      error: errorMsg,
      eventId,
      announcementId
    }
  });
}

function generateIcs(event: any) {
  if (!event.startDate) return null;
  
  const start = new Date(event.startDate);
  const end = (event.endTime || event.endDate) ? new Date(event.endTime || event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);
  
  const icsEvent: ics.EventAttributes = {
    start: [start.getFullYear(), start.getMonth() + 1, start.getDate(), start.getHours(), start.getMinutes()],
    end: [end.getFullYear(), end.getMonth() + 1, end.getDate(), end.getHours(), end.getMinutes()],
    title: event.title,
    description: event.description || '',
    location: event.location || event.meetingLink || '',
    status: 'CONFIRMED',
    busyStatus: 'BUSY',
    organizer: event.club ? {
      name: event.club.name,
      email: event.club.email || "noreply@club.com"
    } : undefined
  };

  const { error, value } = ics.createEvent(icsEvent);
  if (error) {
    console.error('Error generating ICS:', error);
    return null;
  }
  return value;
}

async function fetchAttachment(url: string, defaultName: string) {
  try {
    let content: Buffer;
    let contentType = "application/octet-stream";

    const parts = url.split("/rotaract-media/");
    if (parts.length >= 2) {
      const filePath = parts[1];
      const supabase = getSupabaseAdmin();
      const { data, error } = await supabase.storage.from("rotaract-media").download(filePath);
      if (error) throw error;
      contentType = data.type || "application/octet-stream";
      const arrayBuffer = await data.arrayBuffer();
      content = Buffer.from(arrayBuffer);
    } else {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Status ${response.status}`);
      }
      contentType = response.headers.get("content-type") || "application/octet-stream";
      const arrayBuffer = await response.arrayBuffer();
      content = Buffer.from(arrayBuffer);
    }
    
    const filename = url.split("/").pop() || defaultName;
    const cleanName = filename.replace(/^\d+_[a-z0-9]+_/i, "") || defaultName;

    return {
      filename: cleanName,
      content,
      contentType,
      size: content.length
    };
  } catch (error) {
    console.error(`[Email Service] Failed to fetch attachment from ${url}:`, error);
    return null;
  }
}
