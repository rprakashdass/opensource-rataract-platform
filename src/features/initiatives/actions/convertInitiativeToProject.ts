"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function convertInitiativeToProject(id: string) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const initiative = await prisma.initiative.findUnique({ where: { id } });
    if (!initiative) return { error: "Proposal not found" };
    if (initiative.status !== "APPROVED") return { error: "Only approved proposals can be converted" };

    const baseSlug = slugify(initiative.title) || "initiative";
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.project.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const startDate = initiative.preferredDate || new Date();

    const project = await prisma.project.create({
      data: {
        clubId: initiative.clubId,
        title: initiative.title,
        slug,
        description: initiative.description,
        category: "COMMUNITY_SERVICE",
        status: "PLANNING",
        publishStatus: "DRAFT",
        startDate,
        initiativeId: initiative.id,
      },
    });

    await prisma.initiative.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/admin/proposals");
    revalidatePath("/admin/projects");
    revalidateTag("projects", "max");
    revalidateTag("homepage", "max");

    return { success: true, project };
  } catch (error: any) {
    console.error("Convert initiative to project error:", error);
    return { error: error.message || "Failed to convert proposal to project" };
  }
}
