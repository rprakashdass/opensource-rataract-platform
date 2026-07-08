"use server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";

export async function getActiveProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, title: true }
    });
    revalidateTag("projects", "max"); revalidateTag("homepage", "max");
    return { projects };
  } catch (error) {
    console.error("Failed to fetch active projects:", error);
    revalidateTag("projects", "max"); revalidateTag("homepage", "max");
    return { projects: [] };
  }
}
