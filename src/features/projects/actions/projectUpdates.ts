"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageClub } from "@/lib/auth/session";
import { projectUpdateSchema, ProjectUpdateFormData } from "../schemas/projectUpdate.schema";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createProjectUpdate(data: ProjectUpdateFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const parsed = projectUpdateSchema.parse(data);

    // 1. Fetch parent project to safely inherit clubId server-side
    const project = await prisma.project.findUnique({
      where: { id: parsed.projectId },
      select: { clubId: true, slug: true }
    });

    if (!project) {
      return { error: "Project not found" };
    }

    const { mediaIds, participantIds, ...updateData } = parsed;

    const projectUpdate = await prisma.projectUpdate.create({
      data: {
        ...updateData,
        date: new Date(updateData.date),
        clubId: project.clubId,
        participants: participantIds && participantIds.length > 0 ? {
          create: participantIds.map(id => ({
            memberId: id
          }))
        } : undefined
      }
    });

    if (mediaIds && mediaIds.length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: mediaIds } },
        data: { projectUpdateId: projectUpdate.id, projectId: parsed.projectId }
      });
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "create",
        entity: "projectUpdate",
        entityId: projectUpdate.id,
      }
    });

    revalidateTag("project-updates", "max");
    revalidatePath(`/admin/projects/${parsed.projectId}`);
    revalidatePath(`/projects/${project.slug}`);
    revalidatePath("/");

    return { success: true, projectUpdate };
  } catch (error: any) {
    console.error("Create project update error:", error);
    return { error: error.message || "Failed to create project update" };
  }
}

export async function updateProjectUpdate(id: string, data: ProjectUpdateFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const parsed = projectUpdateSchema.parse(data);

    const existingUpdate = await prisma.projectUpdate.findUnique({
      where: { id },
      include: { project: true }
    });

    if (!existingUpdate) return { error: "Project update not found" };

    const { mediaIds, participantIds, ...updateData } = parsed;

    // We do NOT update clubId. We delete all participants and recreate them.
    const projectUpdate = await prisma.projectUpdate.update({
      where: { id },
      data: {
        ...updateData,
        date: new Date(updateData.date),
        participants: {
          deleteMany: {},
          create: participantIds?.map(pid => ({
            memberId: pid
          })) || []
        }
      }
    });

    // Reset old media links and set new ones
    await prisma.media.updateMany({
      where: { projectUpdateId: id },
      data: { projectUpdateId: null }
    });

    if (mediaIds && mediaIds.length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: mediaIds } },
        data: { projectUpdateId: id, projectId: existingUpdate.projectId }
      });
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "update",
        entity: "projectUpdate",
        entityId: projectUpdate.id,
      }
    });

    revalidateTag("project-updates", "max");
    revalidatePath(`/admin/projects/${existingUpdate.projectId}`);
    revalidatePath(`/projects/${existingUpdate.project.slug}`);
    revalidatePath("/");

    return { success: true, projectUpdate };
  } catch (error: any) {
    console.error("Update project update error:", error);
    return { error: error.message || "Failed to update project update" };
  }
}

export async function deleteProjectUpdate(id: string, deleteMedia: boolean) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const existingUpdate = await prisma.projectUpdate.findUnique({
      where: { id },
      include: { project: true, media: true }
    });

    if (!existingUpdate) return { error: "Project update not found" };

    if (deleteMedia && existingUpdate.media.length > 0) {
      // Delete media from database entirely
      // (Actual file deletion from storage is assumed to happen asynchronously or elsewhere if implemented,
      // but for DB, we delete the records)
      await prisma.media.deleteMany({
        where: { projectUpdateId: id }
      });
    }

    await prisma.projectUpdate.delete({
      where: { id }
    });

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "delete",
        entity: "projectUpdate",
        entityId: id,
      }
    });

    revalidateTag("project-updates", "max");
    revalidatePath(`/admin/projects/${existingUpdate.projectId}`);
    revalidatePath(`/projects/${existingUpdate.project.slug}`);
    revalidatePath("/");

    return { success: true };
  } catch (error: any) {
    console.error("Delete project update error:", error);
    return { error: error.message || "Failed to delete project update" };
  }
}
