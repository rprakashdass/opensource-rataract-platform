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
  status: z.enum(["DRAFT", "UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]),
  
  startTime: z.string(),
  endTime: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  
  projectId: z.string().optional().nullable(),
  
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  
  capacity: z.coerce.number().optional().nullable(),
  registrationRequired: z.boolean().default(false),
  
  tags: z.string().optional(), // Will be split by comma
});

export type EventFormData = z.infer<typeof eventSchema>;
