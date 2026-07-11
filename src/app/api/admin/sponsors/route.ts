import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const club = await getCurrentClub();
    if (!club) {
      return NextResponse.json({ error: "Club not initialized" }, { status: 400 });
    }

    const sponsors = await prisma.sponsor.findMany({
      where: { clubId: club.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(sponsors);
  } catch (error) {
    console.error("Failed to fetch sponsors:", error);
    return NextResponse.json({ error: "Failed to fetch sponsors" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const club = await getCurrentClub();
    if (!club) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();
    
    if (!data.name?.trim()) {
      return NextResponse.json({ error: "Sponsor name is required" }, { status: 400 });
    }

    const sponsor = await prisma.sponsor.create({
      data: {
        clubId: club.id,
        name: data.name,
        logo: data.logo || null,
        website: data.website || null,
        description: data.description || null,
        year: data.year || null,
      }
    });

    return NextResponse.json(sponsor);
  } catch (error: any) {
    console.error("Failed to create sponsor:", error);
    return NextResponse.json({ error: "Failed to create sponsor" }, { status: 500 });
  }
}
