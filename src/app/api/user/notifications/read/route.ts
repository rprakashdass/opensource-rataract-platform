import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !session.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { notificationIds } = body;

    if (!Array.isArray(notificationIds)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // Fetch user to get current readNotifications
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { readNotifications: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Merge arrays and keep unique
    const newReadSet = new Set([...user.readNotifications, ...notificationIds]);
    
    await prisma.user.update({
      where: { id: session.id },
      data: {
        readNotifications: Array.from(newReadSet),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return NextResponse.json(
      { error: "Failed to mark notifications as read" },
      { status: 500 }
    );
  }
}
