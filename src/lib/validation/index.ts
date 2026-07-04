import { z } from "zod";

/**
 * Shared Zod validation schemas
 */

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const signupSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    name: z.string().min(2, "Name must be at least 2 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof signupSchema>;

// ============================================================================
// CLUB SCHEMAS
// ============================================================================

export const clubUpdateSchema = z.object({
  name: z.string().min(1, "Club name is required"),
  district: z.string().optional(),
  country: z.string().default("India"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  description: z.string().optional(),
  missionStatement: z.string().optional(),
  visionStatement: z.string().optional(),
  primaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
  secondaryColor: z.string().regex(/^#[0-9A-F]{6}$/i).optional(),
});

export type ClubUpdateInput = z.infer<typeof clubUpdateSchema>;

// ============================================================================
// EVENT SCHEMAS
// ============================================================================

export const eventCreateSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  location: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  capacity: z.number().int().positive().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;

// ============================================================================
// PROJECT SCHEMAS
// ============================================================================

export const projectCreateSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  slug: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional(),
  impact: z.string().optional(),
  beneficiaries: z.number().int().nonnegative().optional(),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;

// ============================================================================
// CONTACT FORM SCHEMAS
// ============================================================================

export const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export type ContactFormInput = z.infer<typeof contactFormSchema>;

// ============================================================================
// JOIN FORM SCHEMAS
// ============================================================================

export const joinFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone must be at least 10 digits"),
  profession: z.string().optional(),
  companyName: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms",
  }),
});

export type JoinFormInput = z.infer<typeof joinFormSchema>;
