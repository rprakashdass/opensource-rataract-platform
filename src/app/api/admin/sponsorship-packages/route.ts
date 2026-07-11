import { prisma } from "@/lib/prisma";
import { getCurrentClub } from "@/lib/club";
import { NextResponse } from "next/server";
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

    const packages = await prisma.sponsorshipPackage.findMany({
      where: { clubId: club.id },
      orderBy: { amount: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Failed to fetch packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const club = await getCurrentClub();
    if (!club) {
      return NextResponse.json({ error: "Club not initialized" }, { status: 400 });
    }

    const body = await req.json();
    const { title, amount, impactText, description } = body;

    if (!title || !amount || !impactText) {
      return NextResponse.json({ error: "Title, amount, and impact text are required" }, { status: 400 });
    }

    const pkg = await prisma.sponsorshipPackage.create({
      data: {
        clubId: club.id,
        title,
        amount: Number(amount),
        impactText,
        description,
        isActive: true,
      },
    });

    return NextResponse.json(pkg);
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  }
}
