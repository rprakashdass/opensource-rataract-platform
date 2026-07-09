import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { TransactionStatus, TransactionType } from "@prisma/client";

async function verifyAdmin() {
  const session = await getSession();
  if (!session) return false;
  
  // Checking for admin/treasury roles
  return session.roles?.some((r: string) => ['SUPER_ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN'].includes(r));
}

async function verifyFinanceAdmin() {
  const session = await getSession();
  if (!session) return false;

  // Strict finance admin check for edits/deletes
  return session.roles?.some((r: string) => ['SUPER_ADMIN', 'CLUB_ADMIN', 'FINANCE_ADMIN'].includes(r));
}

export async function GET() {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        member: { select: { name: true } },
        event: { select: { title: true } },
      }
    });

    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

    const club = await getOrCreateDefaultClub();
    const payload = await req.json();

    const { title, type, amount, description, category, status, receiptUrl, eventId } = payload;

    if (!amount || !description || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (category) {
      await prisma.financeCategory.upsert({
        where: { id: category },
        update: {},
        create: {
          id: category,
          name: category.replace(/_/g, ' '),
          type: type as any || "EXPENSE"
        }
      });
    }

    const transaction = await prisma.transaction.create({
      data: {
        clubId: club.id,
        title: title || description.substring(0, 50),
        type: type as TransactionType,
        amount: parseFloat(amount),
        description,
        categoryId: category || null,
        status: (status as TransactionStatus) || "COMPLETED",
        receiptUrl: receiptUrl || null,
        eventId: eventId || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const isFinanceAdmin = await verifyFinanceAdmin();
    if (!isFinanceAdmin) return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });

    const { id, status } = await req.json();
    if (!id || !status) return NextResponse.json({ error: "Missing ID or status" }, { status: 400 });

    const updated = await prisma.transaction.update({
      where: { id },
      data: { status: status as TransactionStatus },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
