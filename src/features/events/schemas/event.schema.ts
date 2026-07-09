import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum([
    "COMMUNITY_SERVICE",
    "PROFESSIONAL_DEVELOPMENT",
    "CLUB_SERVICE",
    "INTERNATIONAL_SERVICE",
    "FUNDRAISER",
    "MEETING",
    "FELLOWSHIP"
  ]),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).default("UPCOMING"),
  publishStatus: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishAt: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  meetingLink: z.string().url("Must be a valid URL").optional().nullable().or(z.literal("")),
  
  projectId: z.string().optional().nullable(),
  
  bannerMediaId: z.string().optional().or(z.literal("")),
  posterMediaId: z.string().optional().or(z.literal("")),
  
  capacity: z.number().int().positive().optional().nullable(),
  registrationRequired: z.boolean().default(false),
  registrationEnabled: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  visibility: z.enum(["PUBLIC", "INTERNAL", "MEMBERS_ONLY", "BOARD_ONLY"]).default("PUBLIC"),
  
  tags: z.string().optional(), // Will be split by comma
  
  team: z.array(
    z.object({
      memberId: z.string(),
      role: z.enum(["CHAIR", "CO_CHAIR", "ORGANIZER", "VOLUNTEER"])
    })
  ).optional()
});

export type EventFormData = z.infer<typeof eventSchema>;
