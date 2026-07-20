"use server";

import { prisma } from "@/lib/prisma";
import { getSession, canManageMembers, canManageWebsite } from "@/lib/auth/session";

export type AnonComplaintRecord = {
  id: string;
  category: string;
  message: string;
  status: string;
  adminNote: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export async function getComplaints(
  clubId: string,
  opts?: { status?: string; category?: string; page?: number; pageSize?: number }
): Promise<{ data: AnonComplaintRecord[]; total: number } | { error: string }> {
  try {
    const session = await getSession();
    if (!session || (!canManageMembers(session) && !canManageWebsite(session))) {
      return { error: "Unauthorized" };
    }

    const page = opts?.page ?? 1;
    const pageSize = opts?.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, any> = { clubId };
    if (opts?.status) where.status = opts.status;
    if (opts?.category) where.category = opts.category;

    const [data, total] = await Promise.all([
      prisma.anonComplaint.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
        select: {
          id: true,
          category: true,
          message: true,
          status: true,
          adminNote: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.anonComplaint.count({ where }),
    ]);

    return { data, total };
  } catch (error: any) {
    console.error("[getComplaints] Error:", error);
    return { error: error.message || "Failed to fetch complaints" };
  }
}
