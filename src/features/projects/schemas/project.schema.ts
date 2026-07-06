import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "COMMUNITY_SERVICE",
    "PROFESSIONAL_DEVELOPMENT",
    "CLUB_SERVICE",
    "INTERNATIONAL_SERVICE",
    "FUNDRAISER",
    "OTHER"
  ]),
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "ON_HOLD", "CANCELLED"]),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  coverImage: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  chairPersonId: z.string().optional().nullable(),
  visibility: z.enum(["PUBLIC", "MEMBERS_ONLY", "BOARD_ONLY"]),
  impactMetrics: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
