import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { getOrCreateDefaultClub } from "@/app/api/admin/club/route";
import { handleApiError } from "@/lib/api-error";

function financeAdminOnly(session: any) {
  return session && session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN", "FINANCE_ADMIN"].includes(r));
}

export async function GET() {
  try {
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const club = await getOrCreateDefaultClub();
    const accounts = await prisma.account.findMany({ where: { clubId: club.id }, orderBy: { type: "asc" } });
    return NextResponse.json(accounts);
  } catch (error: any) {
    return handleApiError(error, "Failed to list accounts");
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!financeAdminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized. Finance Admin required." }, { status: 403 });
    }

    const { name, type, currentBalance } = await req.json();
    if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!type?.trim()) return NextResponse.json({ error: "Type is required" }, { status: 400 });

    const club = await getOrCreateDefaultClub();
    const existingCount = await prisma.account.count({ where: { clubId: club.id } });

    const account = await prisma.account.create({
      data: {
        clubId: club.id,
        name: name.trim(),
        type: type.trim(),
        // Opening balance only settable at creation — after this, every
        // balance change should come from an actual ledger transaction.
        currentBalance: currentBalance ? parseFloat(currentBalance) : 0,
        // First account for the club becomes the default automatically
        // (mirrors the old bootstrap-seed's implicit behavior).
        isDefault: existingCount === 0,
      },
    });

    return NextResponse.json(account);
  } catch (error: any) {
    return handleApiError(error, "Failed to create account");
  }
}
