import { z } from "zod";

export const projectUpdateSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  date: z.string().min(1, "Date is required"),
  title: z.string().min(3, "Title must be at least 3 characters"),
  body: z.string().optional().nullable(),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(true),
  beneficiaries: z.coerce.number().int().min(0).optional().nullable(),
  volunteerHours: z.coerce.number().min(0).optional().nullable(),
  impactNote: z.string().optional().nullable(),
  mediaIds: z.array(z.string()).optional(),
  participantIds: z.array(z.string()).optional(),
});

export type ProjectUpdateFormData = z.infer<typeof projectUpdateSchema>;
