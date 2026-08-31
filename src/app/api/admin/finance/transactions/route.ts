import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { handleApiError } from "@/lib/api-error";

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

    if (data.category) {
      await prisma.financeCategory.upsert({
        where: { id: data.category },
        update: {},
        create: {
          id: data.category,
          name: data.category.replace(/_/g, ' '),
          type: data.type || "EXPENSE"
        }
      });
    }

    // Active financial year (create one if none exists yet) — matches createTransaction's action.
    let fy = await prisma.financialYear.findFirst({ where: { clubId: club.id, status: "ACTIVE" } });
    if (!fy) {
      fy = await prisma.financialYear.create({
        data: {
          clubId: club.id,
          name: "RY 2026-27",
          startDate: new Date("2026-07-01"),
          endDate: new Date("2027-06-30"),
          openingBalance: 0,
          status: "ACTIVE",
        },
      });
    }

    // Finance admins are trusted to auto-approve (and may explicitly pick a
    // status, e.g. saving a DRAFT); an event chair recording their own event's
    // spend cannot self-approve — always goes to a finance admin for review,
    // regardless of what the client sends.
    const validClientStatus = ["DRAFT", "PENDING_APPROVAL", "APPROVED"].includes(data.status) ? data.status : "APPROVED";
    const status = adminOnly(session) ? validClientStatus : "PENDING_APPROVAL";
    const amount = parseFloat(data.amount);

    const transaction = await prisma.$transaction(async (tx) => {
      const created = await tx.transaction.create({
        data: {
          clubId: club.id,
          title: data.title || data.description.substring(0, 50),
          type: data.type, // INCOME or EXPENSE
          amount,
          description: data.description,
          categoryId: data.category || null,
          status,
          receiptUrl: data.receiptUrl || null,
          eventId: data.eventId || null,
          accountId: data.accountId || null,
          financialYearId: fy!.id,
          createdBy: session.id,
          userId: session.id,
          memberId: session.member?.id || null,
          approvedBy: status === "APPROVED" ? session.id : null,
          approvedAt: status === "APPROVED" ? new Date() : null,
        },
      });

      if (status === "APPROVED" && data.accountId) {
        await tx.account.update({
          where: { id: data.accountId },
          data: { currentBalance: { increment: data.type === "INCOME" ? amount : -amount } },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.id,
          action: "create_transaction",
          entity: "transaction",
          entityId: created.id,
          changes: JSON.stringify({ title: created.title, amount, type: data.type, status, eventId: data.eventId || null }),
        },
      });

      return created;
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return handleApiError(error, "Failed to create transaction");
  }
}
