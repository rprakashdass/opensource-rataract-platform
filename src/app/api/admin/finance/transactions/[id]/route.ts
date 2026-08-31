import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { sendEmail } from "@/lib/email";
import { getTransactionReceiptEmailHtml } from "@/lib/email-templates";
import { issueReceipt } from "@/features/finance/receipts/issueReceipt";
import { handleApiError } from "@/lib/api-error";

function adminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { status } = await req.json();

    if (!["APPROVED", "REJECTED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: { status },
      include: {
        user: true,
      }
    });

    const club = await prisma.club.findFirst();

    if (status === "APPROVED") {
      // Generate the official receipt (PDF → Supabase Storage) and email it, attached.
      // Wrapped so a receipt/email failure never blocks the approval itself.
      try {
        await issueReceipt(id, { email: true });
      } catch (err) {
        console.error("Failed to issue receipt on approval:", err);
      }
    } else if (transaction.user?.email) {
      // Rejected — notify, no receipt.
      sendEmail({
        to: transaction.user.email,
        subject: "Payment Request Rejected",
        text: `Hi ${transaction.user.name || "Member"},\n\nYour recent payment request for Rs. ${transaction.amount} (${transaction.description || "No description"}) has been rejected by the finance team.`,
        html: getTransactionReceiptEmailHtml(transaction, club),
      }).catch((err) => console.error("Failed to send transaction email:", err));
    }

    return NextResponse.json(transaction);
  } catch (error: any) {
    return handleApiError(error, "Failed to update transaction status");
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { amount, description, date, category } = await req.json();

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : undefined,
        category,
      }
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return handleApiError(error, "Failed to update transaction details");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    await prisma.transaction.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete transaction");
  }
}
