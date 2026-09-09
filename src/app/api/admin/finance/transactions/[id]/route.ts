import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";
import { reverseTransactionEffects } from "@/features/finance/services/reverseTransactionEffects";

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

// Approval/rejection lives solely in `updateTransactionStatus` (the server
// action used by TransactionLedger/TransactionDetailView) — that's the only
// path that correctly credits/reverses the account balance. A PATCH handler
// used to live here too, updating status without ever touching the account,
// silently under-crediting the club's balance. It had no callers; removed
// rather than left as a landmine for something to call it again.

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { amount, description, date, categoryId } = await req.json();

    // categoryId currently doubles as a stable slug ("DUES", "SPONSORSHIP",
    // ...) rather than a real cuid FK — same convention createTransactionCore
    // uses — so it must exist before the Transaction can reference it.
    if (categoryId) {
      const existingTx = await prisma.transaction.findUnique({ where: { id }, select: { type: true } });
      await prisma.financeCategory.upsert({
        where: { id: categoryId },
        update: {},
        create: { id: categoryId, name: categoryId.replace(/_/g, " "), type: existingTx?.type || "EXPENSE" },
      });
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        description,
        date: date ? new Date(date) : undefined,
        categoryId: categoryId ?? undefined,
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

    await prisma.$transaction(async (tx) => {
      const existing = await tx.transaction.findUnique({ where: { id } });
      if (!existing) throw new Error("Transaction not found");

      // If it was approved and already credited to an account/contributor,
      // deleting it must reverse that credit — otherwise the balance stays
      // permanently inflated by an amount that no longer has a transaction
      // backing it.
      await reverseTransactionEffects(tx, existing);

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete transaction");
  }
}
