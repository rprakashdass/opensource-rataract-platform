import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

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

    const request = await prisma.paymentRequest.update({
      where: { id },
      data: {
        title,
        description,
        amount: parseFloat(amount),
        category,
        isGlobal,
        dueDate: dueDate ? new Date(dueDate) : null,
      }
    });

    return NextResponse.json(request);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
