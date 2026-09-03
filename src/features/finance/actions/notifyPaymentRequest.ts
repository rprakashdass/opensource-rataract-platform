"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageFinance } from "@/lib/auth/session";
import { after } from "next/server";
import { sendEmail } from "@/lib/email";
import { getNotificationEmailHtml } from "@/lib/email-templates";
import { formatIST } from "@/lib/date-utils";

/**
 * Emails everyone who still owes on a payment request, with a link to their
 * pay page. Deferred via after() and batched — same reasoning as the
 * bulk-payment/publish-notify fixes: N sequential SMTP sends must never run
 * inline in the request that triggered them.
 */
export async function notifyPaymentRequest(requestId: string) {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return { error: "Unauthorized" };

  const request = await prisma.paymentRequest.findUnique({
    where: { id: requestId },
    include: {
      club: { select: { name: true, logoUrl: true, email: true, phone: true, address: true } },
      assignees: { select: { member: { select: { id: true, name: true, email: true } } } },
      transactions: { where: { status: "APPROVED" }, select: { memberId: true } },
    },
  });
  if (!request) return { error: "Request not found" };

  const audience = request.isGlobal
    ? await prisma.member.findMany({
        where: { clubId: request.clubId, isActive: true },
        select: { id: true, name: true, email: true },
      })
    : request.assignees.map((a) => a.member);

  const paidMemberIds = new Set(request.transactions.map((t) => t.memberId));
  const recipients = audience.filter((m) => m.email && !paidMemberIds.has(m.id));

  if (!recipients.length) return { error: "Nobody left to notify — everyone in the audience has already paid." };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const payLink = `${appUrl}/member/finance/requests/${request.id}`;
  const dueLine = request.dueDate ? `<p style="margin: 4px 0 0;">Due <strong>${formatIST(request.dueDate, "MMM d, yyyy")}</strong></p>` : "";

  after(async () => {
    const CONCURRENCY = 5;
    for (let i = 0; i < recipients.length; i += CONCURRENCY) {
      await Promise.all(
        recipients.slice(i, i + CONCURRENCY).map((m) => {
          const body = `
            <p>A payment request is waiting for you: <strong>${request.title}</strong></p>
            <p style="margin: 12px 0; font-size: 22px; font-weight: 700; color: #111827;">₹${Number(request.amount).toLocaleString("en-IN")}</p>
            ${dueLine}
            <p style="margin-top: 20px;">
              <a href="${payLink}" style="display:inline-block; background:#D41367; color:#fff; padding:10px 20px; border-radius:8px; text-decoration:none; font-weight:600;">Pay now</a>
            </p>
          `;
          return sendEmail({
            to: m.email!,
            subject: `Payment Request: ${request.title}`,
            html: getNotificationEmailHtml(`Payment Request: ${request.title}`, body, m.name || "Member", request.club),
            text: `A payment request is waiting for you: ${request.title} — ₹${Number(request.amount).toLocaleString("en-IN")}. Pay here: ${payLink}`,
          }).catch((err) => console.error(`[notifyPaymentRequest] send failed for ${m.email}:`, err));
        })
      );
    }
  });

  return { success: true, notifiedCount: recipients.length };
}
