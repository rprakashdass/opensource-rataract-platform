"use server";

import { prisma } from "@/lib/prisma";

export async function getActiveProjects() {
  try {
    const projects = await prisma.project.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, title: true }
    });
    return { projects };
  } catch (error) {
    console.error("Failed to fetch active projects:", error);
    return { projects: [] };
  }
}
