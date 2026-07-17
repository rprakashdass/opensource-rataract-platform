"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function deleteProject(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const project = await prisma.project.delete({
      where: { id }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "delete",
        entity: "project",
        entityId: id,
      }
    });

    revalidatePath("/admin");
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Delete project error:", error);
    return { error: error.message || "Failed to delete project" };
  }
}
