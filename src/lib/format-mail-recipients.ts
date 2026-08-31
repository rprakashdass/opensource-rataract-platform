import { MailRecipient } from "@/features/external-mail/schemas/externalMail.schema";

export function formatRecipientsSummary(recipients: unknown): string {
  const list = (recipients as MailRecipient[]) || [];
  if (list.length === 0) return "No recipients";
  if (list.length === 1) return `${list[0].name} <${list[0].email}>`;
  return `${list.length} recipients (${list.map((r) => r.email).join(", ")})`;
}
