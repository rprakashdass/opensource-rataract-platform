import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const club = await getCurrentClub();
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    const roles = await prisma.clubRole.findMany({
      where: { clubId: club.id },
      orderBy: [
        { category: "asc" },
        { displayOrder: "asc" }
      ]
    });

    return NextResponse.json(roles);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const club = await getCurrentClub();
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    const data = await req.json();
    if (!data.name?.trim() || !data.category) {
      return NextResponse.json({ error: "Role name and category are required" }, { status: 400 });
    }

    // Get highest display order for this category
    const lastRole = await prisma.clubRole.findFirst({
      where: { clubId: club.id, category: data.category },
      orderBy: { displayOrder: "desc" }
    });
    const displayOrder = lastRole ? lastRole.displayOrder + 1 : 0;

    const role = await prisma.clubRole.create({
      data: {
        clubId: club.id,
        name: data.name.trim(),
        category: data.category,
        maxMembers: data.maxMembers ? parseInt(data.maxMembers) : null,
        displayOrder
      }
    });

    return NextResponse.json(role);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { id, ...updateData } = data;
    
    if (!id) return NextResponse.json({ error: "Role ID required" }, { status: 400 });

    const club = await getCurrentClub();
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });
    
    if (updateData.maxMembers !== undefined && updateData.maxMembers !== null) {
        updateData.maxMembers = parseInt(updateData.maxMembers);
    }

    const role = await prisma.clubRole.update({
      where: { id, clubId: club.id },
      data: updateData
    });

    return NextResponse.json(role);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.roles?.some((r: string) => ["SUPER_ADMIN", "CLUB_ADMIN"].includes(r))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "Role ID required" }, { status: 400 });

    const club = await getCurrentClub();
    if (!club) return NextResponse.json({ error: "Club not found" }, { status: 404 });

    await prisma.clubRole.delete({
      where: { id, clubId: club.id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
