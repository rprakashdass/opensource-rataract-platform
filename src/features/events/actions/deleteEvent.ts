"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageClub } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function deleteEvent(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { 
      return { error: "Unauthorized" }; 
    }

    const event = await prisma.event.findUnique({
      where: { id }
    });

    if (!event) {
      return { error: "Event not found" };
    }

    await prisma.event.delete({
      where: { id }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "delete",
        entity: "event",
        entityId: id,
      }
    });

    revalidatePath("/admin/events");
    revalidatePath("/admin");
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Delete event error:", error);
    return { error: error.message || "Failed to delete event" };
  }
}
