import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

function adminOnly(session: any) {
  return (
    session &&
    session.roles?.some((r: string) =>
      ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN", "FINANCE_VIEWER"].includes(r)
    )
  );
}

/**
 * GET /api/admin/finance/requests/[id]/payments
 * Returns all APPROVED transactions linked to a payment request,
 * including payer info and receipt details.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        paymentRequestId: id,
        status: "APPROVED",
      },
      orderBy: { date: "desc" },
      select: {
        id: true,
        amount: true,
        date: true,
        paymentMethod: true,
        referenceNumber: true,
        receiptNumber: true,
        receiptDocUrl: true,
        receiptIssuedAt: true,
        member: { select: { id: true, name: true, email: true } },
        user: { select: { id: true, name: true, email: true } },
        contributor: { select: { id: true, name: true } },
      },
    });

    const result = transactions.map((tx) => ({
      id: tx.id,
      amount: Number(tx.amount),
      date: tx.date,
      paymentMethod: tx.paymentMethod,
      referenceNumber: tx.referenceNumber,
      receiptNumber: tx.receiptNumber,
      receiptDocUrl: tx.receiptDocUrl,
      receiptIssuedAt: tx.receiptIssuedAt,
      payerName:
        tx.member?.name || tx.user?.name || tx.contributor?.name || "—",
      payerEmail: tx.member?.email || tx.user?.email || null,
      memberId: tx.member?.id || null,
    }));

    return NextResponse.json(result);
  } catch (error: any) {
    return handleApiError(error, "Failed to retrieve payments for request");
  }
}
