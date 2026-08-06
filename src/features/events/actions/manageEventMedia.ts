"use server";

import { getSession , canManageClub } from "@/lib/auth/session";
import { canManageEvent } from "@/lib/auth/canManageEvent";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";
import { revalidatePublicRoutes } from "@/lib/revalidate";

// revalidatePublicRoutes() only busts the static /events listing — the
// individual /events/[slug] detail page is its own ISR-cached route and needs
// its own revalidatePath call, keyed by slug, or edits here won't show up
// there until the 5-minute revalidate window expires.
async function revalidatePublicEventPage(eventId: string) {
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { slug: true } });
  if (event?.slug) revalidatePath(`/events/${event.slug}`);
}

export async function toggleMediaFeature(mediaId: string, isFeatured: boolean, eventId: string) {
  try {
    const session = await getSession();
    if (!session || !(await canManageEvent(session, eventId))) { return { error: "Unauthorized" }; }

    await prisma.media.update({
      where: { id: mediaId },
      data: { isFeatured }
    });

    revalidatePath(`/admin/events/${eventId}`);
    await revalidatePublicEventPage(eventId);
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Toggle media feature error:", error);
    return { error: error.message || "Failed to update media" };
  }
}

// Assigns mediaId as the event's banner/poster, or clears that role if the
// same media already holds it (so an admin can undo a wrong pick).
export async function setEventMediaRole(mediaId: string, eventId: string, role: "banner" | "poster") {
  try {
    const session = await getSession();
    if (!session || !(await canManageEvent(session, eventId))) { return { error: "Unauthorized" }; }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { bannerMediaId: true, posterMediaId: true },
    });
    if (!event) return { error: "Event not found" };

    const currentId = role === "banner" ? event.bannerMediaId : event.posterMediaId;
    const nextId = currentId === mediaId ? null : mediaId;

    await prisma.event.update({
      where: { id: eventId },
      data: role === "banner" ? { bannerMediaId: nextId } : { posterMediaId: nextId },
    });

    revalidatePath(`/admin/events/${eventId}`);
    await revalidatePublicEventPage(eventId);
    revalidatePublicRoutes();

    return { success: true, cleared: nextId === null };
  } catch (error: any) {
    console.error("Set event media role error:", error);
    return { error: error.message || "Failed to update media" };
  }
}

export async function deleteEventMedia(mediaId: string, eventId: string) {
  try {
    const session = await getSession();
    if (!session || !(await canManageEvent(session, eventId))) { return { error: "Unauthorized" }; }

    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) return { error: "Media not found" };

    await prisma.media.delete({
      where: { id: mediaId }
    });

    revalidatePath(`/admin/events/${eventId}`);
    await revalidatePublicEventPage(eventId);
    revalidatePublicRoutes();

    return { success: true };
  } catch (error: any) {
    console.error("Delete media error:", error);
    return { error: error.message || "Failed to delete media" };
  }
}
