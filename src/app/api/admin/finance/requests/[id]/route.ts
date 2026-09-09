import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageFinance } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { title, description, amount, dueDate, category, isGlobal } = await req.json();

    // categoryId is the real (FinanceCategory-backed) system now; `category`
    // (the legacy enum) is kept in sync alongside it — see POST /requests.
    const categoryValue = category || "OTHER";
    let categoryId: string | null = null;
    if (categoryValue !== "OTHER") {
      await prisma.financeCategory.upsert({
        where: { id: categoryValue },
        update: {},
        create: { id: categoryValue, name: categoryValue.replace(/_/g, " "), type: "INCOME" },
      });
      categoryId = categoryValue;
    }

    const request = await prisma.paymentRequest.update({
      where: { id },
      data: {
        title,
        description,
        amount: parseFloat(amount),
        category: categoryValue,
        categoryId,
        isGlobal,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    return NextResponse.json(request);
  } catch (error: any) {
    return handleApiError(error, "Failed to update payment request");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    await prisma.paymentRequest.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete payment request");
  }
}
