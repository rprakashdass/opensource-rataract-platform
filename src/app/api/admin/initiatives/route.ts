import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";
import { getSession } from "@/lib/auth/session";

function validateInitiativePayload(data: any) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Initiative title is required.");
  }
  if (typeof data.slug !== "string" || !data.slug.trim()) {
    throw new Error("Initiative slug is required.");
  }
  if (typeof data.startDate !== "string" || !data.startDate.trim()) {
    throw new Error("Initiative start date is required.");
  }
  if (typeof data.frequency !== "string" || !data.frequency.trim()) {
    throw new Error("Initiative frequency is required.");
  }

  const frequency = data.frequency.trim().toUpperCase();
  if (!["DAILY", "WEEKLY", "MONTHLY"].includes(frequency)) {
    throw new Error("Initiative frequency must be daily, weekly, or monthly.");
  }

  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    description: typeof data.description === "string" ? data.description.trim() : null,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null,
    frequency,
    status: typeof data.status === "string" && data.status.trim() ? data.status.trim() : "active",
    startDate: new Date(data.startDate),
    endDate: typeof data.endDate === "string" && data.endDate.trim() ? new Date(data.endDate) : null,
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const payload = validateInitiativePayload(data);
    const club = await getOrCreateDefaultClub();

    const initiative = await prisma.initiative.create({
      data: {
        clubId: club.id,
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        imageUrl: payload.imageUrl,
        frequency: payload.frequency as any,
        status: payload.status,
        startDate: payload.startDate,
        endDate: payload.endDate,
      },
    });

    return NextResponse.json(initiative);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const initiatives = await prisma.initiative.findMany({
      include: {
        events: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true,
            status: true,
          },
          orderBy: {
            startDate: "desc",
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json(initiatives);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (!(session.roles?.includes('ADMIN') || session.roles?.includes('CLUB_ADMIN')))) {
      return NextResponse.json({ error: "Access Denied: Only Admins can delete initiatives" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    await prisma.initiative.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    const updated = await prisma.initiative.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        imageUrl: data.imageUrl,
        frequency: typeof data.frequency === "string" ? data.frequency.toUpperCase() as any : undefined,
        status: data.status,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma error in admin initiatives PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
