import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { handleApiError } from "@/lib/api-error";

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

// Name/type only — never the balance directly. A balance correction should
// go through a real ledger transaction so it stays auditable, not a silent
// overwrite of a number nothing else explains.
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { name, type } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const account = await prisma.account.update({
      where: { id },
      data: { name: name.trim(), type: type || undefined },
    });

    return NextResponse.json(account);
  } catch (error: any) {
    return handleApiError(error, "Failed to update account");
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    // Check if there are any transactions linked to this account
    const txCount = await prisma.transaction.count({
      where: { accountId: id }
    });

    if (txCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete account. There are transactions linked to it." },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return handleApiError(error, "Failed to delete account");
  }
}
