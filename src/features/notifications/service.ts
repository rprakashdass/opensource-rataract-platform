import { NotificationTrigger } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import * as ics from "ics";

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

  let subject = "";
  let body = "";
  let attachments: any[] = [];
  
  let headerTitle = "Club Update";
  
  // 1. Fetch Context
  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { club: true } });
    if (event) {
      subject = `Event Update: ${event.title}`;
      body = `<p>Hi there,</p><p>We have a new update regarding <strong>${event.title}</strong>.</p>`;
      
      if (trigger === "EVENT_CREATED") {
        headerTitle = "Event Invitation";
        subject = `[Invitation] ${event.title}`;
        
        const start = new Date(event.startDate);
        const dateStr = start.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        const timeStr = start.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        });
        
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const eventUrl = `${appUrl}/events/${event.slug}`;
        
        // Generate Google Calendar Link
        const end = event.endTime ? new Date(event.endTime) : new Date(start.getTime() + 60 * 60 * 1000);
        const formatForGoogle = (d: Date) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForGoogle(start)}/${formatForGoogle(end)}&details=${encodeURIComponent(event.description || "")}&location=${encodeURIComponent(event.location || event.meetingLink || "")}`;

        body = `
          <p style="font-size: 15px; margin-top: 0; margin-bottom: 20px; color: #1f2937;">Hi {{memberName}},</p>
          <p style="font-size: 15px; margin-bottom: 24px; color: #4b5563; line-height: 1.6;">You are cordially invited to attend our upcoming event: <strong>${event.title}</strong>. Here are the details:</p>
          
          <div style="background-color: #faf5ff; border: 1px solid #f3e8ff; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6b21a8; width: 100px; vertical-align: top;">Date:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${dateStr}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6b21a8; vertical-align: top;">Time:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${timeStr}</td>
              </tr>
              ${event.location ? `
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6b21a8; vertical-align: top;">Location:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937; font-weight: 600;">${event.location}</td>
              </tr>
              ` : ""}
              ${event.meetingLink ? `
              <tr>
                <td style="padding: 6px 0; font-size: 14px; font-weight: bold; color: #6b21a8; vertical-align: top;">Online Link:</td>
                <td style="padding: 6px 0; font-size: 14px; color: #1f2937;"><a href="${event.meetingLink}" style="color: #6d28d9; font-weight: bold; text-decoration: underline;">Join Online Meeting</a></td>
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
            <a href="${eventUrl}" style="background-color: #6d28d9; color: #ffffff; font-weight: 800; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; text-decoration: none; padding: 14px 28px; border-radius: 8px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(109, 40, 217, 0.2);">
              View Event Details & RSVP
            </a>
          </div>

          <div style="text-align: center; border-top: 1px solid #f3f4f6; padding-top: 16px; margin-top: 24px;">
            <a href="${googleCalUrl}" target="_blank" rel="noopener noreferrer" style="color: #6b21a8; font-size: 12px; font-weight: 700; text-decoration: underline; display: inline-block;">
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
    const ann = await prisma.announcement.findUnique({ where: { id: announcementId } });
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

        const htmlSkeleton = (body: string) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
          <div style="background-color: #6d28d9; padding: 24px; text-align: center; border-radius: 12px 12px 0 0;">
            <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em;">${headerTitle}</h2>
          </div>
          <div style="padding: 30px 24px; border: 1px solid #e5e7eb; border-top: none; background-color: #ffffff;">
            ${body}
          </div>
          <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-radius: 0 0 12px 12px; font-size: 11px; color: #9ca3af; border: 1px solid #e5e7eb; border-top: none; font-weight: 500;">
            You are receiving this email because you are a member of our club.
          </div>
        </div>`;

       for (const u of users) {
         if (!u.email) continue;
         let personalBody = body;
         if (personalBody) {
           personalBody = personalBody.replace(/{{memberName}}/g, u.name || "Member");
         }

         await sendEmail({
           to: u.email,
           subject,
           html: htmlSkeleton(personalBody),
           attachments: attachments.length > 0 ? attachments : undefined
         });
       }
       
       // Handle any recipients that weren't found in the DB (fallback)
       const foundEmails = new Set(users.map(u => u.email));
       const missingRecipients = recipients.filter(r => !foundEmails.has(r));
       if (missingRecipients.length > 0) {
         for (const email of missingRecipients) {
            let personalBody = body;
            if (personalBody) personalBody = personalBody.replace(/{{memberName}}/g, "Member");
            await sendEmail({
               to: email,
               subject,
               html: htmlSkeleton(personalBody),
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
