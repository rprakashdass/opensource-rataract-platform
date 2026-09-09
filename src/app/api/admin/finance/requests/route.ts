import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
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
    const requests = await prisma.paymentRequest.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
      include: {
        assignees: {
          include: {
            member: true,
          }
        },
        transactions: true,
      },
    });

    return NextResponse.json(requests);
  } catch (error: any) {
    return handleApiError(error, "Failed to retrieve payment requests");
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

    if (!data.title || !data.amount) {
      return NextResponse.json({ error: "Title and Amount are required" }, { status: 400 });
    }

    // categoryId is the real (FinanceCategory-backed) system now; `category`
    // (the legacy enum) is kept in sync alongside it while anything still
    // reads the old column — dropped in a later migration once nothing does.
    const categoryValue = data.category || "OTHER";
    let categoryId: string | null = null;
    if (categoryValue !== "OTHER") {
      await prisma.financeCategory.upsert({
        where: { id: categoryValue },
        update: {},
        create: { id: categoryValue, name: categoryValue.replace(/_/g, " "), type: "INCOME" },
      });
      categoryId = categoryValue;
    }

    const request = await prisma.paymentRequest.create({
      data: {
        clubId: club.id,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        amount: parseFloat(data.amount),
        category: categoryValue,
        categoryId,
        isGlobal: data.isGlobal,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignees: {
          create: !data.isGlobal && data.assignees && data.assignees.length > 0
            ? data.assignees.map((memberId: string) => ({
                memberId,
              }))
            : [],
        },
      },
      include: {
        assignees: true,
      },
    });

    return NextResponse.json(request);
  } catch (error: any) {
    return handleApiError(error, "Failed to create payment request");
  }
}
