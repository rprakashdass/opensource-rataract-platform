import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

function adminOnly(session: any) {
  return session && (session.role === "ADMIN" || session.role === "CLUB_ADMIN");
}

export async function GET() {
  try {
    const session = await getSession();
    if (!adminOnly(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    
    // Fallback to first club (usually there is only one)
    const club = await prisma.club.findFirst();
    if (!club) return NextResponse.json({ error: "No club found" }, { status: 404 });

    const meetings = await prisma.meeting.findMany({
      where: { clubId: club.id },
      orderBy: { date: "desc" },
    });
    return NextResponse.json(meetings);
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

    const club = await prisma.club.findFirst();
    if (!club) return NextResponse.json({ error: "No club found" }, { status: 404 });

    const { title, date, location, agenda } = await req.json();

    const meeting = await prisma.meeting.create({
      data: {
        title,
        date: new Date(date),
        location,
        agenda,
        clubId: club.id
      },
    });
    
    return NextResponse.json(meeting);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
