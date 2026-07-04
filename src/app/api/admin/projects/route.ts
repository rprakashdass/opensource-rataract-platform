import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getOrCreateDefaultClub } from "../club/route";
import { getSession } from "@/lib/auth/session";

function validateProjectPayload(data: any) {
  if (typeof data.title !== "string" || !data.title.trim()) {
    throw new Error("Project title is required.");
  }
  if (typeof data.slug !== "string" || !data.slug.trim()) {
    throw new Error("Project slug is required.");
  }
  if (typeof data.startDate !== "string" || !data.startDate.trim()) {
    throw new Error("Project start date is required.");
  }

  return {
    title: data.title.trim(),
    slug: data.slug.trim(),
    description: typeof data.description === "string" ? data.description.trim() : null,
    startDate: new Date(data.startDate),
    endDate: typeof data.endDate === "string" && data.endDate.trim() ? new Date(data.endDate) : null,
    imageUrl: typeof data.imageUrl === "string" && data.imageUrl.trim() ? data.imageUrl.trim() : null,
    status: typeof data.status === "string" && data.status.trim() ? data.status.trim() : "planning",
    category: typeof data.category === "string" && data.category.trim() ? data.category.trim() : "Community",
  };
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const payload = validateProjectPayload(data);
    const club = await getOrCreateDefaultClub();

    const project = await prisma.project.create({
      data: {
        clubId: club.id,
        title: payload.title,
        slug: payload.slug,
        description: payload.description,
        startDate: payload.startDate,
        endDate: payload.endDate,
        imageUrl: payload.imageUrl,
        status: payload.status,
        category: payload.category,
      },
    });

    return NextResponse.json(project);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "ADMIN" && session.role !== "CLUB_ADMIN")) {
      return NextResponse.json({ error: "Access Denied: Only Admins can delete projects" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Id is required" }, { status: 400 });
    }
    await prisma.project.delete({ where: { id } });
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

    const updated = await prisma.project.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        imageUrl: data.imageUrl,
        status: data.status,
        category: data.category,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Prisma error in admin projects PUT API:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
