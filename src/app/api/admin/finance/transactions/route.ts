import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { handleApiError } from "@/lib/api-error";
import { createTransactionCore } from "@/features/finance/services/createTransactionCore";

function adminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

export async function GET() {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const club = await getOrCreateDefaultClub();
    const transactions = await prisma.transaction.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      include: {
        member: true,
        user: true,
        paymentRequest: true,
      },
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return handleApiError(error, "Failed to retrieve transactions");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    const data = await req.json();

    // Finance admins can record any transaction; an event's chair/co-chair
    // can only record transactions scoped to their own event.
    const authorized = adminOnly(session) || (data.eventId && (await canManageEvent(session, data.eventId)));
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const club = await getOrCreateDefaultClub();

    if (!data.amount || !data.description || !data.type) {
      return NextResponse.json({ error: "Amount, description, and type are required" }, { status: 400 });
    }

    // Finance admins are trusted to auto-approve (and may explicitly pick a
    // status, e.g. saving a DRAFT); an event chair recording their own event's
    // spend cannot self-approve — always goes to a finance admin for review,
    // regardless of what the client sends.
    const validClientStatus = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(data.status) ? data.status : "APPROVED";
    const status = adminOnly(session) ? validClientStatus : "PENDING_APPROVAL";

    const result = await createTransactionCore({
      clubId: club.id,
      title: data.title,
      description: data.description,
      amount: parseFloat(data.amount),
      type: data.type,
      status,
      autoApprove: status === "APPROVED",
      payer: { mode: "self", userId: session.id, memberId: session.member?.id || null },
      categoryId: data.category || null,
      categoryType: data.type,
      accountId: data.accountId || null,
      eventId: data.eventId || null,
      receiptUrl: data.receiptUrl || null,
      createdBy: session.id,
      // Generic ledger entries (this route covers both INCOME and EXPENSE,
      // e.g. an admin logging a supply cost) aren't a "payment received from
      // someone" — no receipt PDF/email, matching this route's prior behavior.
      issueReceiptNow: false,
    });
    if ("error" in result) return NextResponse.json({ error: result.error }, { status: 400 });

    return NextResponse.json(result.transaction);
  } catch (error: any) {
    return handleApiError(error, "Failed to create transaction");
  }
}
