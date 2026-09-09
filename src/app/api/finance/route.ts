import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { handleApiError } from "@/lib/api-error";
import { sendEmail } from "@/lib/email";
import { createTransactionCore } from "@/features/finance/services/createTransactionCore";

// Helper to get logged in user
async function getSessionUser() {
  const session = await getSession();
  if (!session) return null;

  return prisma.user.findUnique({
    where: { id: session.id },
    include: { member: true },
  });
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return handleApiError(error, "Failed to retrieve transactions");
  }
}

export async function POST(req: Request) {
  try {
    // Prefer the actual incoming request's origin over NEXT_PUBLIC_APP_URL —
    // a misconfigured env var (e.g. left as localhost in prod) would
    // otherwise silently produce broken links in this email.
    const baseUrl = new URL(req.url).origin || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const club = await getOrCreateDefaultClub();
    const payload = await req.json();

    const { amount, description, category, receiptUrl, eventId, paymentRequestId } = payload;

    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 });
    }

    const result = await createTransactionCore({
      clubId: user.member?.clubId || club.id,
      title: payload.title,
      description,
      amount: parseFloat(amount),
      type: "INCOME", // Member payments are INCOME for the club
      status: "PENDING_APPROVAL", // Needs treasury approval
      autoApprove: false,
      payer: { mode: "self", userId: user.id, memberId: user.member?.id || null },
      categoryId: category || null,
      categoryType: "INCOME",
      receiptUrl: receiptUrl || null,
      eventId: eventId || null,
      paymentRequestId: paymentRequestId || null,
      createdBy: user.id,
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const transaction = result.transaction;

    // Notify the Treasurer (board position) so a submission -> approval
    // doesn't just sit unnoticed until someone happens to check the panel.
    after(async () => {
      try {
        const treasurer = await prisma.boardMember.findFirst({
          where: { clubId: transaction.clubId, position: { equals: "Treasurer", mode: "insensitive" }, leftAt: null },
          include: { member: { select: { email: true, name: true } } },
        });

        const recipients = new Map<string, string>();
        if (treasurer?.member?.email) recipients.set(treasurer.member.email, treasurer.member.name || "Treasurer");

        const payerName = user.member?.name || user.name || "A member";
        const amountStr = `₹${Number(transaction.amount).toLocaleString("en-IN")}`;

        for (const [email, name] of recipients) {
          await sendEmail({
            to: email,
            subject: `Payment awaiting approval — ${amountStr} from ${payerName}`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <p>Hi ${name},</p>
                <p><strong>${payerName}</strong> submitted a payment of <strong>${amountStr}</strong> for approval.</p>
                <p><strong>Description:</strong> ${description}</p>
                <p><a href="${baseUrl}/admin/finance/transactions/${transaction.id}">Review and approve</a></p>
              </div>
            `,
            text: `${payerName} submitted a payment of ${amountStr} for approval. ${description}`,
          }).catch((err) => console.error("[finance/route] treasurer notify failed:", err));
        }
      } catch (err) {
        console.error("[finance/route] failed to notify approvers:", err);
      }
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return handleApiError(error, "Failed to create transaction");
  }
}
