import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const club = await getOrCreateDefaultClub();

    if (!data.amount || !data.description || !data.type) {
      return NextResponse.json({ error: "Amount, description, and type are required" }, { status: 400 });
    }

    const transaction = await prisma.transaction.create({
      data: {
        clubId: club.id,
        type: data.type, // INCOME or EXPENSE
        amount: parseFloat(data.amount),
        description: data.description,
        category: data.category || "OTHER",
        status: "APPROVED", // Admin-created transactions are auto-approved
        receiptUrl: data.receiptUrl || null,
      },
    });

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
