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
  status: z.enum(["PLANNING", "ACTIVE", "COMPLETED", "CANCELLED"]).default("PLANNING"),
  publishStatus: z.enum(["DRAFT", "SCHEDULED", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  publishAt: z.string().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  startDate: z.string(),
  endDate: z.string().optional().nullable(),
  coverMediaId: z.string().optional(),
  isFeatured: z.boolean().default(false),
  impactSummary: z.string().optional(),
  visibility: z.enum(["PUBLIC", "INTERNAL", "MEMBERS_ONLY", "BOARD_ONLY"]).default("PUBLIC"),
  impactMetrics: z.string().optional().nullable(),
  team: z.array(
    z.object({
      memberId: z.string(),
      role: z.enum(["CHAIR", "CO_CHAIR", "ORGANIZER", "VOLUNTEER"])
    })
  ).optional()
});

export type ProjectFormData = z.infer<typeof projectSchema>;
