"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { projectSchema, ProjectFormData } from "../schemas/project.schema";
import { revalidatePath } from "next/cache";

export async function updateProject(id: string, data: ProjectFormData) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    const parsed = projectSchema.parse(data);

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...parsed,
        startDate: new Date(parsed.startDate),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        impactMetrics: parsed.impactMetrics ? JSON.parse(parsed.impactMetrics) : undefined,
      }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "update",
        entity: "project",
        entityId: project.id,
      }
    });

    revalidatePath("/admin");
    revalidatePath("/projects");
    revalidatePath(`/admin/projects/${id}`);

    return { success: true, project };
  } catch (error: any) {
    console.error("Update project error:", error);
    return { error: error.message || "Failed to update project" };
  }
}
