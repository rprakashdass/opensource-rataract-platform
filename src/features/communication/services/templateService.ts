import { EmailTemplateType, PrismaClient } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const DEFAULT_TEMPLATES: Record<EmailTemplateType, { subject: string; body: string }> = {
  EVENT_PUBLISHED: {
    subject: "New Event: {{eventName}}",
    body: "<p>Hello {{memberName}},</p><p>{{clubName}} is hosting a new event: <strong>{{eventName}}</strong>!</p><p><strong>Date:</strong> {{eventDate}}</p><p><strong>Venue:</strong> {{venue}}</p><p>Register here: <a href='{{link}}'>{{link}}</a></p>"
  },
  EVENT_UPDATED: {
    subject: "Update: {{eventName}}",
    body: "<p>Hello {{memberName}},</p><p>There has been an update to <strong>{{eventName}}</strong>.</p><p>Please check the latest details on our website.</p><p><a href='{{link}}'>View Event</a></p>"
  },
  EVENT_REMINDER: {
    subject: "Reminder: {{eventName}} is tomorrow!",
    body: "<p>Hello {{memberName}},</p><p>This is a reminder that <strong>{{eventName}}</strong> is happening soon.</p><p><strong>Date:</strong> {{eventDate}}</p><p><strong>Venue:</strong> {{venue}}</p><p>We look forward to seeing you there!</p>"
  },
  PROJECT_PUBLISHED: {
    subject: "New Initiative: {{eventName}}",
    body: "<p>Hello {{memberName}},</p><p>We have launched a new project: <strong>{{eventName}}</strong>.</p><p><a href='{{link}}'>View Project</a></p>"
  },
  ANNOUNCEMENT_PUBLISHED: {
    subject: "Notice: {{eventName}}",
    body: "<p>Hello {{memberName}},</p><p>A new announcement has been published by {{clubName}}.</p><p><a href='{{link}}'>Read More</a></p>"
  },
  ATTENDANCE_CONFIRMED: {
    subject: "Registration Confirmed: {{eventName}}",
    body: "<p>Hello {{memberName}},</p><p>Your registration for <strong>{{eventName}}</strong> is confirmed.</p><p><strong>Date:</strong> {{eventDate}}</p><p><strong>Venue:</strong> {{venue}}</p><p>See you soon!</p>"
  }
};

export async function getTemplate(clubId: string, type: EmailTemplateType) {
  const defaultTpl = DEFAULT_TEMPLATES[type];
  
  if (!defaultTpl) {
    throw new Error(`No default template configured for type ${type}`);
  }

  // Use upsert to handle concurrent requests and avoid unique constraint failures
  const template = await prisma.emailTemplate.upsert({
    where: { clubId_type: { clubId, type } },
    update: {},
    create: {
      clubId,
      type,
      subjectTemplate: defaultTpl.subject,
      bodyTemplate: defaultTpl.body
    }
  });

  return template;
}

export function renderTemplate(templateString: string, data: Record<string, string>) {
  let rendered = templateString;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, value || "");
  }
  return rendered;
}
