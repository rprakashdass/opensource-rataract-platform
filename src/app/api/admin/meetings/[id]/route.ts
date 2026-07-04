import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();

    const meeting = await prisma.meeting.update({
      where: { id },
      data,
    });

    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await prisma.meeting.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
