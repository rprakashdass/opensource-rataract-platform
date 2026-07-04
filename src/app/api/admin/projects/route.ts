import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const club = await getOrCreateDefaultClub();

    const project = await prisma.project.create({
      data: {
        clubId: club.id,
        title: data.title,
        slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, ""),
        description: data.description,
        startDate: new Date(data.startDate || Date.now()),
        endDate: data.endDate ? new Date(data.endDate) : null,
        imageUrl: data.imageUrl || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=800",
        status: data.status || "planning",
        category: data.category || "Community",
      },
    });

    return NextResponse.json(project);
  } catch (error: any) {
    console.error("Prisma error in admin projects API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: {
        startDate: "desc",
      },
    });
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    await prisma.project.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
