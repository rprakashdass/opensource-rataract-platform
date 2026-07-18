import { google } from "googleapis";

export interface CalendarEventData {
  title: string;
  description?: string | null;
  location?: string | null;
  startDate: Date;
  endDate?: Date | null;
  meetingLink?: string | null;
}

function getCalendarClient() {
  const credentialsJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!credentialsJson) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not set in environment variables");
  }

  let credentials;
  try {
    credentials = JSON.parse(credentialsJson);
  } catch (error) {
    throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON is not a valid JSON string");
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/calendar.events"],
  });

  return google.calendar({ version: "v3", auth });
}

function getCalendarId() {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID is not set in environment variables");
  }
  return calendarId;
}

function buildConferenceData(meetingLink: string | null | undefined) {
  if (!meetingLink) return undefined;
  const isMeet = /meet\.google\.com/i.test(meetingLink);
  if (!isMeet) return undefined;
  return {
    conferenceSolution: {
      key: { type: "hangoutsMeet" },
    },
    entryPoints: [
      {
        entryPointType: "video",
        uri: meetingLink,
        label: "Google Meet",
      },
    ],
  };
}

export async function createCalendarEvent(data: CalendarEventData): Promise<string> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_CALENDAR_ID) {
    console.log(`[Calendar Stub] Creating calendar event for: ${data.title}`);
    return `cal_stub_${Date.now()}`;
  }

  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  // Prefer physical location; fall back to meeting link so Google Calendar
  // can detect the Meet URL and show a proper "Join" button.
  const effectiveLocation = data.location || data.meetingLink || undefined;
  const conferenceData = buildConferenceData(data.meetingLink);

  const event: any = {
    summary: data.title,
    description: data.description || undefined,
    location: effectiveLocation,
    start: {
      dateTime: data.startDate.toISOString(),
    },
    end: {
      dateTime: (data.endDate || new Date(data.startDate.getTime() + 60 * 60 * 1000)).toISOString(),
    },
  };

  if (conferenceData) {
    event.conferenceData = conferenceData;
  }

  const res = await calendar.events.insert({
    calendarId,
    conferenceDataVersion: conferenceData ? 1 : 0,
    requestBody: event,
  });

  return res.data.id!;
}

export async function updateCalendarEvent(calendarEventId: string, data: CalendarEventData): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_CALENDAR_ID) {
    console.log(`[Calendar Stub] Updating calendar event ${calendarEventId} for: ${data.title}`);
    return;
  }
  
  if (calendarEventId.startsWith("cal_stub_")) {
    console.log(`[Calendar Stub] Stub event skipped update: ${calendarEventId}`);
    return;
  }

  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const effectiveLocation = data.location || data.meetingLink || undefined;
  const conferenceData = buildConferenceData(data.meetingLink);

  const event: any = {
    summary: data.title,
    description: data.description || undefined,
    location: effectiveLocation,
    start: {
      dateTime: data.startDate.toISOString(),
    },
    end: {
      dateTime: (data.endDate || new Date(data.startDate.getTime() + 60 * 60 * 1000)).toISOString(),
    },
  };

  if (conferenceData) {
    event.conferenceData = conferenceData;
  }

  await calendar.events.patch({
    calendarId,
    eventId: calendarEventId,
    conferenceDataVersion: conferenceData ? 1 : 0,
    requestBody: event,
  });
}

export async function deleteCalendarEvent(calendarEventId: string): Promise<void> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_CALENDAR_ID) {
    console.log(`[Calendar Stub] Deleting calendar event ${calendarEventId}`);
    return;
  }

  if (calendarEventId.startsWith("cal_stub_")) {
    console.log(`[Calendar Stub] Stub event skipped deletion: ${calendarEventId}`);
    return;
  }

  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  await calendar.events.delete({
    calendarId,
    eventId: calendarEventId,
  });
}
