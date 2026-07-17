"use server";

import { prisma } from "@/lib/prisma";
import { getSession , canManageClub } from "@/lib/auth/session";
import { eventSchema, EventFormData } from "../schemas/event.schema";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";
import { dispatchNotification } from "@/features/notifications/service";
import { getCurrentClub } from "@/lib/club";
import { setupEventDriveFolder } from "@/features/storage/googleDrive";

export async function createEvent(data: EventFormData) {
  try {
    const session = await getSession();
    if (!session || !canManageClub(session)) { return { error: "Unauthorized" }; }

    const parsed = eventSchema.parse(data);

    const club = await getCurrentClub();
    if (!club) {
      return { error: "Club not found in database" };
    }

    const baseSlug = parsed.slug || parsed.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let suffix = 1;
    while (await prisma.event.findUnique({ where: { clubId_slug: { clubId: club.id, slug } } })) {
      slug = `${baseSlug}-${++suffix}`;
    }

    const { team, bannerMediaId, posterMediaId, sendEmailNotification, sendEmailToBoard, attachCalendarInvite, ...eventData } = parsed;

    const event = await prisma.event.create({
      data: {
        ...eventData,
        status: eventData.publishStatus === "DRAFT" 
          ? "DRAFT" 
          : (() => {
              const start = new Date(eventData.startTime);
              const end = eventData.endTime ? new Date(eventData.endTime) : new Date(start.getTime() + 4 * 60 * 60 * 1000);
              return end < new Date() ? "COMPLETED" : "UPCOMING";
            })(),
        slug,
        tags: eventData.tags ? eventData.tags.split(',').map(t => t.trim()) : [],
        startDate: new Date(eventData.startTime),
        startTime: new Date(eventData.startTime),
        endTime: eventData.endTime ? new Date(eventData.endTime) : null,
        publishAt: eventData.publishAt ? new Date(eventData.publishAt) : null,
        publishedAt: eventData.publishedAt ? new Date(eventData.publishedAt) : null,
        clubId: club.id,
        bannerMediaId: bannerMediaId || null,
        posterMediaId: posterMediaId || null,
        members: team && team.length > 0 ? {
          create: team.map(t => ({
            memberId: t.memberId,
            role: t.role as any
          }))
        } : undefined
      }
    });

    const linkedMediaIds = [bannerMediaId, posterMediaId].filter(Boolean) as string[];
    if (linkedMediaIds.length > 0) {
      await prisma.media.updateMany({
        where: { id: { in: linkedMediaIds } },
        data: { eventId: event.id }
      });
    }

    if (eventData.publishStatus !== "DRAFT" && (sendEmailNotification || sendEmailToBoard)) {
        let whereClause: any = { member: { isNot: null } };
        if (sendEmailToBoard) {
            whereClause = { member: { boardMemberships: { some: {} } } };
        }
        
        const users = await prisma.user.findMany({
            where: whereClause,
            select: { email: true }
        });
        
        const emails = users.map(u => u.email).filter(Boolean) as string[];
        
        if (emails.length > 0) {
            // Lazy import to avoid circular dependencies or heavy server logic on load
            const { dispatchNotification } = await import("@/features/notifications/service");
            await dispatchNotification({
                trigger: "EVENT_CREATED",
                recipients: emails,
                eventId: event.id,
                sendEmailFlag: true,
                attachCalendarFlag: attachCalendarInvite
            });
        }
    }

    // Create Drive Folder if env is configured
    try {
      const year = new Date(event.startDate).getFullYear();
      const driveFolderId = await setupEventDriveFolder(club.name, event.title, year.toString());
      if (driveFolderId) {
        await prisma.event.update({
          where: { id: event.id },
          data: { driveFolderId }
        });
      }
    } catch (err) {
      console.warn("Failed to create Google Drive folder for event:", err);
    }

    // Log the audit
    await prisma.auditLog.create({
      data: {
        userId: session.id,
        action: "create",
        entity: "event",
        entityId: event.id,
      }
    });

    revalidatePath("/admin");
    revalidatePublicRoutes();

    return { success: true, event };
  } catch (error: any) {
    console.error("Create event error:", error);
    return { error: error.message || "Failed to create event" };
  }
}
