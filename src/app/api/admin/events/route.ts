import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";

function validateEventPayload(data: any) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Event title is required.");
  }
  if (typeof data.slug !== "string" || !data.slug.trim()) {
    throw new Error("Event slug is required.");
  }
  if (typeof data.location !== "string" || !data.location.trim()) {
    throw new Error("Event location is required.");
  }
  if (typeof data.startDate !== "string" || !data.startDate.trim()) {
    throw new Error("Event start date is required.");
  }

  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    description: typeof data.description === "string" ? data.description.trim() : null,
    location: data.location.trim(),
    startDate: new Date(data.startDate),
    endDate: typeof data.endDate === "string" && data.endDate.trim() ? new Date(data.endDate) : null,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null,
    status: typeof data.status === "string" && data.status.trim() ? data.status.trim() : "upcoming",
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const payload = validateEventPayload(data);
    const club = await getOrCreateDefaultClub();

    const event = await prisma.event.create({
      data: {
        clubId: club.id,
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        location: payload.location,
        startDate: payload.startDate,
        endDate: payload.endDate,
        imageUrl: payload.imageUrl,
        status: payload.status,
      },
    });

    return NextResponse.json(event);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
    return NextResponse.json(events);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    await prisma.event.delete({ where: { id } });
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

    const updated = await prisma.event.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        location: data.location,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        imageUrl: data.imageUrl,
        status: data.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma error in admin events PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
