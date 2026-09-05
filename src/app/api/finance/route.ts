import { NextResponse, after } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { handleApiError } from "@/lib/api-error";
import { sendEmail } from "@/lib/email";

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
    const user = await getSessionUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const club = await getOrCreateDefaultClub();
    const payload = await req.json();

    const { amount, description, category, receiptUrl, eventId, paymentRequestId } = payload;

    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 });
    }

    if (category) {
      await prisma.financeCategory.upsert({
        where: { id: category },
        update: {},
        create: {
          id: category,
          name: category.replace(/_/g, ' '),
          type: "INCOME" // Member contributions are usually income
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        clubId: user.member?.clubId || club.id,
        userId: user.id,
        memberId: user.member?.id || null,
        title: payload.title || description.substring(0, 50),
        type: "INCOME", // Member payments are INCOME for the club
        status: "PENDING_APPROVAL", // Needs treasury approval
        amount: parseFloat(amount),
        description,
        categoryId: category || null,
        receiptUrl: receiptUrl || null,
        eventId: eventId || null,
        paymentRequestId: paymentRequestId || null,
      },
    });

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
                <p><a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/admin/finance/transactions/${transaction.id}">Review and approve</a></p>
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
