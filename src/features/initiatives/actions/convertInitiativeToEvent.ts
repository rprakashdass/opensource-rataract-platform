"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function convertInitiativeToEvent(id: string) {
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
    while (await prisma.event.findUnique({ where: { clubId_slug: { clubId: initiative.clubId, slug } } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const startTime = initiative.preferredDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const event = await prisma.event.create({
      data: {
        clubId: initiative.clubId,
        title: initiative.title,
        slug,
        description: initiative.description,
        type: "COMMUNITY_SERVICE",
        status: "UPCOMING",
        publishStatus: "DRAFT",
        startDate: startTime,
        startTime,
        initiativeId: initiative.id,
      },
    });

    await prisma.initiative.update({
      where: { id },
      data: { status: "CONVERTED" },
    });

    revalidatePath(`/admin/proposals/${id}`);
    revalidatePath("/admin/proposals");
    revalidatePath("/admin/events");
    revalidateTag("events", "max");
    revalidateTag("homepage", "max");

    return { success: true, event };
  } catch (error: any) {
    console.error("Convert initiative to event error:", error);
    return { error: error.message || "Failed to convert proposal to event" };
  }
}
