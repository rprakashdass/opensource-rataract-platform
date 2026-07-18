import { z } from "zod";
import { prisma } from "@/lib/prisma";

export const MediaContextSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("event"),
    eventId: z.string().min(1, "eventId is required"),
    title: z.string().min(1, "title is required"),
  }),
  z.object({
    kind: z.literal("project"),
    projectId: z.string().min(1, "projectId is required"),
    title: z.string().min(1, "title is required"),
  }),
  z.object({
    kind: z.literal("projectUpdate"),
    projectId: z.string().min(1, "projectId is required"),
    projectUpdateId: z.string().min(1, "projectUpdateId is required"),
    title: z.string().min(1, "title is required"),
  }),
  z.object({ kind: z.literal("members") }),
  z.object({ kind: z.literal("announcements") }),
  z.object({ kind: z.literal("website") }),
  z.object({ kind: z.literal("sponsors") }),
  z.object({ kind: z.literal("finance") }),
  z.object({ kind: z.literal("memories") }),
  z.object({ kind: z.literal("general"), albumId: z.string().nullable().optional() }),
]);

export type MediaContext = z.infer<typeof MediaContextSchema>;

export async function getOrCreateAlbum(
  clubId: string,
  context: MediaContext
) {
  let albumTitle = "General";
  let eventId = null;
  let projectId = null;
  
  if (context.kind === "event") {
    // Validate ownership
    const event = await prisma.event.findUnique({ where: { id: context.eventId } });
    if (!event || event.clubId !== clubId) {
      throw new Error("Invalid or unauthorized eventId");
    }
    albumTitle = `Events / ${context.title}`;
    eventId = context.eventId;
  } else if (context.kind === "project") {
    const project = await prisma.project.findUnique({ where: { id: context.projectId } });
    if (!project || project.clubId !== clubId) {
      throw new Error("Invalid or unauthorized projectId");
    }
    albumTitle = `Projects / ${context.title}`;
    projectId = context.projectId;
  } else if (context.kind === "projectUpdate") {
    const project = await prisma.project.findUnique({ where: { id: context.projectId } });
    if (!project || project.clubId !== clubId) {
      throw new Error("Invalid or unauthorized projectId");
    }
    // ensure projectUpdate belongs to project
    const update = await prisma.projectUpdate.findUnique({ where: { id: context.projectUpdateId } });
    if (!update || update.projectId !== context.projectId) {
       throw new Error("Invalid projectUpdateId");
    }
    albumTitle = `Projects / ${context.title}`;
    projectId = context.projectId;
  } else if (context.kind === "members") {
    albumTitle = "Members";
  } else if (context.kind === "announcements") {
    albumTitle = "Announcements";
  } else if (context.kind === "website") {
    albumTitle = "Website";
  } else if (context.kind === "sponsors") {
    albumTitle = "Sponsors";
  } else if (context.kind === "finance") {
    albumTitle = "Finance / Receipts";
  } else if (context.kind === "memories") {
    albumTitle = "Memories";
    const settings = await prisma.websiteSettings.findUnique({ where: { clubId } });
    if (settings?.galleryAlbumId) {
      const existing = await prisma.album.findUnique({ where: { id: settings.galleryAlbumId } });
      if (existing) return { albumId: existing.id, eventId: null, projectId: null };
    }
  } else if (context.kind === "general") {
    if (context.albumId) {
      const album = await prisma.album.findUnique({ where: { id: context.albumId } });
      if (!album || album.clubId !== clubId) {
        throw new Error("Invalid or unauthorized albumId");
      }
      return {
        albumId: album.id,
        eventId: album.eventId,
        projectId: album.projectId
      };
    }
    albumTitle = "General";
  }

  // Find existing
  const album = await prisma.album.findFirst({
    where: {
      clubId,
      ...(eventId ? { eventId } : { eventId: null }),
      ...(projectId ? { projectId } : { projectId: null }),
      ...(!eventId && !projectId ? { title: albumTitle } : {}),
    }
  });

  if (album) {
    if (context.kind === "memories") {
      await prisma.websiteSettings.update({
        where: { clubId },
        data: { galleryAlbumId: album.id }
      });
    }
    return {
       albumId: album.id,
       eventId: album.eventId,
       projectId: album.projectId
    };
  }

  // Create new
  const newAlbum = await prisma.album.create({
    data: {
      clubId,
      title: albumTitle,
      eventId,
      projectId
    }
  });

  if (context.kind === "memories") {
    await prisma.websiteSettings.update({
      where: { clubId },
      data: { galleryAlbumId: newAlbum.id }
    });
  }

  return {
     albumId: newAlbum.id,
     eventId: newAlbum.eventId,
     projectId: newAlbum.projectId
  };
}
