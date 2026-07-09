import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && ((session.roles?.includes('SUPER_ADMIN') || session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')));
}

// GET: Fetch internal login accounts only (Users with NO linked public Member)
export async function GET() {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST: Create a new internal login account (no Member profile)
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { loginId, password, name, roles } = await req.json();

    if (!loginId || !password) {
      return NextResponse.json({ error: "Login ID and Password are required." }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: loginId.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Login ID is already in use." }, { status: 400 });
    }

    const user = await prisma.user.create({
      data: {
        email: loginId.toLowerCase(),
        password,
        name: name || "Internal Account",
        roles: roles || ["ADMIN"],
      },
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update credentials (Login ID, Password, Role)
export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id, loginId, password, roles } = await req.json();
    if (!id) return NextResponse.json({ error: "User ID is required." }, { status: 400 });

    const updateData: any = {};
    if (loginId) updateData.email = loginId.toLowerCase();
    if (password) updateData.password = password;
    if (roles && Array.isArray(roles)) updateData.roles = roles;

    await prisma.user.update({ where: { id }, data: updateData });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE: Remove an internal login account
export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "User ID is required." }, { status: 400 });

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
