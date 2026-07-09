import { z } from "zod";

export const initiativeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  portfolioId: z.string().optional().nullable(),
  problemStatement: z.string().optional().nullable(),
  expectedImpact: z.string().optional().nullable(),
  estimatedBudget: z.number().positive().optional().nullable(),
  preferredDate: z.string().optional().nullable(),
  attachments: z.array(z.string()).default([]),
});

export type InitiativeFormData = z.infer<typeof initiativeSchema>;
