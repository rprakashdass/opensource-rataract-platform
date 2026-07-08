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
  
  // 1. Fetch Context
  if (eventId) {
    const event = await prisma.event.findUnique({ where: { id: eventId }, include: { club: true } });
    if (event) {
      subject = `Event Update: ${event.title}`;
      body = `<p>Hi there,</p><p>We have a new update regarding <strong>${event.title}</strong>.</p>`;
      
      if (trigger === "EVENT_CREATED") subject = `New Event: ${event.title}`;
      if (trigger === "ATTENDANCE_CONFIRMED") {
        subject = `Registration Confirmed: ${event.title}`;
        body = `<p>Hi,</p><p>Your registration for <strong>${event.title}</strong> has been confirmed.</p><p>We look forward to seeing you there!</p>`;
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
       await sendEmail({
         to: recipients,
         subject,
         html: body,
         attachments: attachments.length > 0 ? attachments : undefined
       });
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
  const end = event.endDate ? new Date(event.endDate) : new Date(start.getTime() + 60 * 60 * 1000);
  
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
