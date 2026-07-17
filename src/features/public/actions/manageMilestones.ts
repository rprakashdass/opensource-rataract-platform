"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageWebsite } from "@/lib/auth/session";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

export async function saveMilestone(data: { id?: string, year: string, title: string, description: string, clubId: string }) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) { return { error: "Unauthorized" }; }

    let milestone;
    if (data.id) {
      milestone = await prisma.milestone.update({
        where: { id: data.id },
        data: {
          year: data.year,
          title: data.title,
          description: data.description,
        }
      });
    } else {
      milestone = await prisma.milestone.create({
        data: {
          clubId: data.clubId,
          year: data.year,
          title: data.title,
          description: data.description,
        }
      });
    }

    revalidatePublicRoutes();
    revalidatePath("/admin/website/milestones");
    revalidateTag("milestones", "max");

    return { success: true, data: milestone };
  } catch (error: any) {
    return { error: error.message || "Failed to save milestone" };
  }
}

export async function deleteMilestone(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) { return { error: "Unauthorized" }; }

    await prisma.milestone.delete({ where: { id } });

    revalidatePublicRoutes();
    revalidatePath("/admin/website/milestones");
    revalidateTag("milestones", "max");

    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete milestone" };
  }
}
