import { z } from "zod";

export const transactionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional().nullable(),
  amount: z.number().positive("Amount must be greater than 0"),
  type: z.enum(["INCOME", "EXPENSE"]),
  categoryId: z.string().min(1, "Category is required"),
  accountId: z.string().min(1, "Account is required"),
  projectId: z.string().optional().nullable(),
  eventId: z.string().optional().nullable(),
  paymentMethod: z.enum(["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "OTHER"]),
  referenceNumber: z.string().optional().nullable(),
  receiptUrl: z.string().url().optional().nullable().or(z.string().length(0)),
  date: z.string().optional(),
  status: z.enum(["DRAFT", "PENDING_APPROVAL", "APPROVED", "REJECTED", "VOIDED"]).optional()
});

export const transferSchema = z.object({
  fromAccountId: z.string().min(1, "From Account is required"),
  toAccountId: z.string().min(1, "To Account is required"),
  amount: z.number().positive("Amount must be positive"),
  date: z.string().optional(),
});
