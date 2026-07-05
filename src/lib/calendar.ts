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

export async function createCalendarEvent(data: CalendarEventData): Promise<string> {
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_JSON || !process.env.GOOGLE_CALENDAR_ID) {
    console.log(`[Calendar Stub] Creating calendar event for: ${data.title}`);
    return `cal_stub_${Date.now()}`;
  }

  const calendar = getCalendarClient();
  const calendarId = getCalendarId();

  const event = {
    summary: data.title,
    description: data.description || undefined,
    location: data.location || undefined,
    start: {
      dateTime: data.startDate.toISOString(),
    },
    end: {
      dateTime: (data.endDate || new Date(data.startDate.getTime() + 60 * 60 * 1000)).toISOString(),
    },
  };

  const res = await calendar.events.insert({
    calendarId,
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

  const event = {
    summary: data.title,
    description: data.description || undefined,
    location: data.location || undefined,
    start: {
      dateTime: data.startDate.toISOString(),
    },
    end: {
      dateTime: (data.endDate || new Date(data.startDate.getTime() + 60 * 60 * 1000)).toISOString(),
    },
  };

  await calendar.events.patch({
    calendarId,
    eventId: calendarEventId,
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
