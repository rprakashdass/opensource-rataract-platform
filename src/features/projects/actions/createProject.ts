"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { projectSchema, ProjectFormData } from "../schemas/project.schema";
import { revalidatePath } from "next/cache";

export async function createProject(data: ProjectFormData) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN") && !session.roles?.includes("BOARD_MEMBER"))) {
      return { error: "Unauthorized" };
    }

    // Verify validation again on server
    const parsed = projectSchema.parse(data);

    // Get the club ID from a config or session. For this app, let's assume one club or get the first one.
    const club = await prisma.club.findFirst();
    if (!club) {
      return { error: "Club not found in database" };
    }

    let slug = parsed.slug;
    if (!slug) {
      slug = parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    const project = await prisma.project.create({
      data: {
        ...parsed,
        slug,
        startDate: new Date(parsed.startDate),
        endDate: parsed.endDate ? new Date(parsed.endDate) : null,
        impactMetrics: parsed.impactMetrics ? JSON.parse(parsed.impactMetrics) : undefined,
        clubId: club.id,
      }
    });

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
    revalidatePath("/projects");

    return { success: true, project };
  } catch (error: any) {
    console.error("Create project error:", error);
    return { error: error.message || "Failed to create project" };
  }
}
