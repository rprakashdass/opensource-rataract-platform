import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    await prisma.sponsor.delete({
      where: { id },
    });

    revalidatePublicRoutes();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sponsor:", error);
    return NextResponse.json({ error: "Failed to delete sponsor" }, { status: 500 });
  }
}
