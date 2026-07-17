"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { projectSchema, ProjectFormData } from "../schemas/project.schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function updateProject(id: string, data: ProjectFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const parsed = projectSchema.parse(data);

    const { team, ...projectData } = parsed;

    const project = await prisma.project.update({
      where: { id },
      data: {
        ...projectData,
        startDate: new Date(projectData.startDate),
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        publishAt: projectData.publishAt ? new Date(projectData.publishAt) : null,
        publishedAt: projectData.publishedAt ? new Date(projectData.publishedAt) : null,
        impactMetrics: projectData.impactMetrics ? JSON.parse(projectData.impactMetrics) : undefined,
        ...(team && {
          members: {
            deleteMany: {},
            create: team.map(t => ({
              memberId: t.memberId,
              role: t.role as any
            }))
          }
        })
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
    revalidatePath(`/admin/projects/${id}`);
    revalidatePublicRoutes();

    return { success: true, project };
  } catch (error: any) {
    console.error("Update project error:", error);
    return { error: error.message || "Failed to update project" };
  }
}
