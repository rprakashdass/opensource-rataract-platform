"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { PublishStatus } from "@prisma/client";
import { revalidatePath, revalidateTag } from "next/cache";
import { sendEmail } from "@/lib/email";

export type PublishActionInput = {
  entityType: "EVENT" | "PROJECT" | "ANNOUNCEMENT";
  entityId: string;
  publishStatus: PublishStatus;
  publishAt?: Date | null;
  
  // Notification options
  notifyMembers?: boolean;
  subject?: string;
  body?: string;
  recipientRules?: any;
  attachCalendar?: boolean;
  
  // Announcement option
  generateAnnouncement?: boolean;
};

export async function publishContent(input: PublishActionInput) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    let clubId = "";
    let itemTitle = "";
    let itemDesc = "";
    
    // 1. Update Content Status
    if (input.entityType === "EVENT") {
      const event = await prisma.event.findUnique({ where: { id: input.entityId } });
      if (!event) return { error: "Event not found" };
      clubId = event.clubId;
      itemTitle = event.title;
      itemDesc = event.description || "";
      
      await prisma.event.update({
        where: { id: input.entityId },
        data: {
          publishStatus: input.publishStatus,
          publishAt: input.publishAt,
          publishedAt: input.publishStatus === "PUBLISHED" ? new Date() : null,
        }
      });
    } else if (input.entityType === "PROJECT") {
      const project = await prisma.project.findUnique({ where: { id: input.entityId } });
      if (!project) return { error: "Project not found" };
      clubId = project.clubId;
      itemTitle = project.title;
      itemDesc = project.description || "";

      await prisma.project.update({
        where: { id: input.entityId },
        data: {
          publishStatus: input.publishStatus,
          publishAt: input.publishAt,
          publishedAt: input.publishStatus === "PUBLISHED" ? new Date() : null,
        }
      });
    } else if (input.entityType === "ANNOUNCEMENT") {
      const ann = await prisma.announcement.findUnique({ where: { id: input.entityId } });
      if (!ann) return { error: "Announcement not found" };
      clubId = ann.clubId;
      itemTitle = ann.title;
      
      await prisma.announcement.update({
        where: { id: input.entityId },
        data: {
          publishStatus: input.publishStatus,
          publishAt: input.publishAt,
          publishedAt: input.publishStatus === "PUBLISHED" ? new Date() : null,
        }
      });
    }

    // 2. Scheduled Communication
    if (input.notifyMembers && input.subject && input.body) {
      const sendAt = input.publishAt || new Date(); // If scheduled, schedule email too
      
      const comm = await prisma.scheduledCommunication.create({
        data: {
          clubId,
          subject: input.subject,
          body: input.body,
          recipientRules: input.recipientRules || { type: "ALL" },
          sendAt,
          status: sendAt <= new Date() ? "PENDING" : "PENDING", // cron will pick it up
          eventId: input.entityType === "EVENT" ? input.entityId : null,
          projectId: input.entityType === "PROJECT" ? input.entityId : null,
          announcementId: input.entityType === "ANNOUNCEMENT" ? input.entityId : null,
        }
      });

      if (sendAt <= new Date()) {
        try {
          const rules = typeof comm.recipientRules === 'string' ? JSON.parse(comm.recipientRules as string) : comm.recipientRules as any;
          const recipientType = rules?.type || "ALL";

          let whereClause: any = { member: { isNot: null } };
          if (recipientType === "BOARD") {
             whereClause = { member: { boardMemberships: { some: {} } } };
          }

          const users = await prisma.user.findMany({
            where: whereClause,
            select: { email: true, name: true }
          });

          const htmlSkeleton = (body: string) => `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
            <div style="background-color: #6d28d9; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h2 style="margin: 0; color: #ffffff;">Club Update</h2>
            </div>
            <div style="padding: 30px 20px; border: 1px solid #e5e7eb; border-top: none;">
              ${body}
            </div>
            <div style="background-color: #f9fafb; padding: 15px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px; color: #6b7280; border: 1px solid #e5e7eb; border-top: none;">
              You are receiving this email because you are a member of our club.
            </div>
          </div>`;

          // Send individually so we can replace {{memberName}}
          for (const u of users) {
            if (!u.email) continue;
            let personalBody = comm.body;
            if (personalBody) {
              personalBody = personalBody.replace(/{{memberName}}/g, u.name || "Member");
            }
            
            await sendEmail({
              to: u.email,
              subject: comm.subject,
              html: htmlSkeleton(personalBody),
            });
          }

          await prisma.scheduledCommunication.update({
            where: { id: comm.id },
            data: { status: "SENT" }
          });
        } catch (err: any) {
          await prisma.scheduledCommunication.update({
            where: { id: comm.id },
            data: { status: "FAILED", errorLog: err.message }
          });
        }
      }
    }

    // 3. Generate Announcement (if not already an announcement)
    if (input.generateAnnouncement && input.entityType !== "ANNOUNCEMENT") {
      await prisma.announcement.create({
        data: {
          title: `New ${input.entityType === "EVENT" ? "Event" : "Project"}: ${itemTitle}`,
          description: itemDesc,
          clubId,
          publishStatus: input.publishStatus,
          publishAt: input.publishAt,
          publishedAt: input.publishStatus === "PUBLISHED" ? new Date() : null,
        }
      });
    }

    revalidatePath("/admin");
    revalidateTag("homepage", "max"); revalidateTag("events", "max"); revalidateTag("projects", "max"); revalidateTag("gallery", "max");
    revalidatePath(`/admin/events/${input.entityId}`);
    revalidateTag("homepage", "max"); revalidateTag("events", "max"); revalidateTag("projects", "max"); revalidateTag("gallery", "max");
    revalidatePath(`/admin/projects/${input.entityId}`);
    revalidateTag("homepage", "max"); revalidateTag("events", "max"); revalidateTag("projects", "max"); revalidateTag("gallery", "max");
    revalidatePath("/events");
    revalidateTag("homepage", "max"); revalidateTag("events", "max"); revalidateTag("projects", "max"); revalidateTag("gallery", "max");
    revalidatePath("/projects");
    revalidateTag("homepage", "max"); revalidateTag("events", "max"); revalidateTag("projects", "max"); revalidateTag("gallery", "max");

    return { success: true };
  } catch (error: any) {
    console.error("Publish action error:", error);
    return { error: error.message || "Failed to publish content" };
  }
}
