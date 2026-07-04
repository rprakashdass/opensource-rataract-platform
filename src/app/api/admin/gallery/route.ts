import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      include: {
        event: {
          select: { title: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return NextResponse.json(items);
  } catch (error: any) {
    console.warn("Failed to fetch gallery items from DB, returning empty fallback:", error.message);
    return NextResponse.json([]);
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const club = await getOrCreateDefaultClub();

    if (!data.imageUrl || !data.title) {
      return NextResponse.json({ error: "Title and Image are required" }, { status: 400 });
    }

    const item = await prisma.galleryItem.create({
      data: {
        clubId: club.id,
        title: data.title,
        description: data.description || "",
        imageUrl: data.imageUrl,
        category: data.category || "random",
        eventId: data.eventId || null,
      }
    });

    return NextResponse.json(item);
  } catch (error: any) {
    console.error("Prisma error in admin gallery POST API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    const { id } = data;
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }

    const updated = await prisma.galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || "",
        imageUrl: data.imageUrl,
        category: data.category || "random",
        eventId: data.eventId || null,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma error in admin gallery PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "CLUB_ADMIN")) {
      return NextResponse.json({ error: "Access Denied: Only Admins can delete gallery items" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    await prisma.galleryItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Prisma error in admin gallery DELETE API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
