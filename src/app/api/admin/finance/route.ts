import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { TransactionStatus, TransactionType } from "@prisma/client";

async function verifyAdmin() {
  const session = await getSession();
  if (!session) return false;
  
  // Checking for admin/treasury roles
  return session.roles?.some(r => ['ADMIN', 'CLUB_ADMIN', 'TREASURER'].includes(r));
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

    const { type, amount, description, category, status, receiptUrl, eventId } = payload;

    if (!amount || !description || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        clubId: club.id,
        type: type as TransactionType,
        amount: parseFloat(amount),
        description,
        category: category || "OTHER",
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
    const isAdmin = await verifyAdmin();
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

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
