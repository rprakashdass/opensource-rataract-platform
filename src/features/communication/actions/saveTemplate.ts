"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { EmailTemplateType } from "@prisma/client";
import { getCurrentClub } from "@/lib/club";
import { revalidatePath } from "next/cache";

export async function saveTemplate(data: { type: EmailTemplateType, subjectTemplate: string, bodyTemplate: string, enabled: boolean }) {
  try {
    const session = await getSession();
    if (!session || (!session.roles?.includes("SUPER_ADMIN") && !session.roles?.includes("ADMIN") && !session.roles?.includes("CLUB_ADMIN"))) {
      return { error: "Unauthorized" };
    }

    const club = await getCurrentClub();
    if (!club) return { error: "Club not found" };

    const template = await prisma.emailTemplate.upsert({
      where: {
        clubId_type: {
          clubId: club.id,
          type: data.type
        }
      },
      update: {
        subjectTemplate: data.subjectTemplate,
        bodyTemplate: data.bodyTemplate,
        enabled: data.enabled
      },
      create: {
        clubId: club.id,
        type: data.type,
        subjectTemplate: data.subjectTemplate,
        bodyTemplate: data.bodyTemplate,
        enabled: data.enabled
      }
    });

    revalidatePath("/admin/settings/templates");
    return { success: true, template };
  } catch (error: any) {
    console.error("Save template error:", error);
    return { error: error.message || "Failed to save template" };
  }
}
