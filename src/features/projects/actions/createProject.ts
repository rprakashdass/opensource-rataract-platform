"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { projectSchema, ProjectFormData } from "../schemas/project.schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function createProject(data: ProjectFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    // Verify validation again on server
    const parsed = projectSchema.parse(data);

    // Get the club ID from a config or session. For this app, let's assume one club or get the first one.
    const club = await prisma.club.findFirst();
    if (!club) {
      return { error: "Club not found in database" };
    }

    const baseSlug = parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const { team, coverMediaId, ...projectData } = parsed;

    const project = await prisma.project.create({
      data: {
        ...projectData,
        slug,
        startDate: new Date(projectData.startDate),
        endDate: projectData.endDate ? new Date(projectData.endDate) : null,
        publishAt: projectData.publishAt ? new Date(projectData.publishAt) : null,
        publishedAt: projectData.publishedAt ? new Date(projectData.publishedAt) : null,
        impactMetrics: projectData.impactMetrics ? JSON.parse(projectData.impactMetrics) : undefined,
        clubId: club.id,
        members: team && team.length > 0 ? {
          create: team.map(t => ({
            memberId: t.memberId,
            role: t.role as any
          }))
        } : undefined
      }
    });

    if (coverMediaId) {
      await prisma.media.update({
        where: { id: coverMediaId },
        data: { projectId: project.id, isCover: true }
      });
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "create",
        entity: "project",
        entityId: project.id,
      }
    });

    revalidatePath("/admin");
    revalidatePublicRoutes();

    return { success: true, project };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { error: error.message || "Failed to create project" };
  }
}
