import { z } from "zod";

export const mailRecipientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Enter a valid email address"),
});

export type MailRecipient = z.infer<typeof mailRecipientSchema>;

export const deliveryModeSchema = z.enum(["BCC", "CC", "SEPARATE"]);

export const externalMailComposeSchema = z.object({
  recipients: z.array(mailRecipientSchema).min(1, "Add at least one recipient"),
  deliveryMode: deliveryModeSchema.default("BCC"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  body: z.string().min(10, "Message must be at least 10 characters"),
});

export type ExternalMailComposeFormData = z.infer<typeof externalMailComposeSchema>;
