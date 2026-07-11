"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageWebsite } from "@/lib/auth/session";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath, revalidateTag } from "next/cache";

function revalidatePortfolios() {
  revalidatePath("/about");
  revalidatePath("/team");
  revalidatePath("/admin/settings/portfolios");
  revalidateTag("club", "max");
  revalidateTag("homepage", "max");
  revalidateTag("portfolios", "max");
  revalidateTag("team", "max");
}

export async function savePortfolio(data: {
  id?: string;
  name: string;
  description?: string;
  icon?: string;
  activities?: string[];
  isActive?: boolean;
}) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    if (!data.name?.trim()) return { error: "Portfolio name is required" };

    let portfolio;
    if (data.id) {
      portfolio = await prisma.portfolio.update({
        where: { id: data.id, clubId: club.id },
        data: {
          name: data.name.trim(),
          description: data.description?.trim() || null,
          icon: data.icon?.trim() || "Circle",
          activities: data.activities || [],
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    } else {
      const lastPortfolio = await prisma.portfolio.findFirst({
        where: { clubId: club.id },
        orderBy: { displayOrder: "desc" },
      });
      portfolio = await prisma.portfolio.create({
        data: {
          clubId: club.id,
          name: data.name.trim(),
          description: data.description?.trim() || null,
          icon: data.icon?.trim() || "Circle",
          activities: data.activities || [],
          displayOrder: lastPortfolio ? lastPortfolio.displayOrder + 1 : 0,
          isActive: data.isActive !== undefined ? data.isActive : true,
        },
      });
    }

    revalidatePortfolios();
    return { success: true, data: portfolio };
  } catch (error: any) {
    return { error: error.message || "Failed to save portfolio" };
  }
}

export async function deletePortfolio(id: string) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    await prisma.portfolio.delete({ where: { id, clubId: club.id } });

    revalidatePortfolios();
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to delete portfolio" };
  }
}

export async function reorderPortfolios(orderedPairs: { id: string; displayOrder: number }[]) {
  try {
    const session = await getSession();
    if (!session || !canManageWebsite(session)) return { error: "Unauthorized" };

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    await prisma.$transaction(
      orderedPairs.map(({ id, displayOrder }) =>
        prisma.portfolio.update({ where: { id, clubId: club.id }, data: { displayOrder } })
      )
    );

    revalidatePortfolios();
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Failed to reorder portfolios" };
  }
}
