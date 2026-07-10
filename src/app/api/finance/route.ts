import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";

// Helper to get logged in user
async function getSessionUser() {
  const session = await getSession();
  if (!session || !canManageFinance(session)) return null;

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
    return NextResponse.json({ error: error.message }, { status: 500 });
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
        clubId: club.id,
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

    return NextResponse.json(transaction);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
