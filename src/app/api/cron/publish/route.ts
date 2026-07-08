import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export async function GET(request: Request) {
  try {
    const now = new Date();

    // 1. Process Events
    const eventsToPublish = await prisma.event.findMany({
      where: {
        publishStatus: "SCHEDULED",
        publishAt: { lte: now }
      },
    });

    if (eventsToPublish.length > 0) {
      await prisma.event.updateMany({
        where: { id: { in: eventsToPublish.map((e) => e.id) } },
        data: {
          publishStatus: "PUBLISHED",
          publishedAt: now,
        },
      });
    }

    // 2. Process Projects
    const projectsToPublish = await prisma.project.findMany({
      where: {
        publishStatus: "SCHEDULED",
        publishAt: { lte: now }
      },
    });

    if (projectsToPublish.length > 0) {
      await prisma.project.updateMany({
        where: { id: { in: projectsToPublish.map((p) => p.id) } },
        data: {
          publishStatus: "PUBLISHED",
          publishedAt: now,
        },
      });
    }

    // 3. Process Announcements
    const announcementsToPublish = await prisma.announcement.findMany({
      where: {
        publishStatus: "SCHEDULED",
        publishAt: { lte: now }
      },
    });

    if (announcementsToPublish.length > 0) {
      await prisma.announcement.updateMany({
        where: { id: { in: announcementsToPublish.map((p) => p.id) } },
        data: {
          publishStatus: "PUBLISHED",
          publishedAt: now,
        },
      });
    }

    // 4. Process Scheduled Communications
    const commsToSend = await prisma.scheduledCommunication.findMany({
      where: {
        status: "PENDING",
        sendAt: { lte: now }
      }
    });

    let emailsSentCount = 0;
    
    for (const comm of commsToSend) {
      try {
        // Resolve Recipients based on comm.recipientRules
        const rules = typeof comm.recipientRules === 'string' ? JSON.parse(comm.recipientRules) : comm.recipientRules as any;
        const recipientType = rules?.type || "ALL";

        let whereClause: any = { member: { isNot: null } };
        if (recipientType === "BOARD") {
           whereClause = { member: { boardMemberships: { some: {} } } };
        }

        const users = await prisma.user.findMany({
          where: whereClause,
          select: { email: true }
        });

        const emails = users.map(u => u.email).filter(Boolean) as string[];

        if (emails.length > 0) {
          await sendEmail({
            to: emails,
            subject: comm.subject,
            html: comm.body,
          });
          emailsSentCount++;
        }

        await prisma.scheduledCommunication.update({
          where: { id: comm.id },
          data: { status: "SENT" }
        });
      } catch (err: any) {
        await prisma.scheduledCommunication.update({
          where: { id: comm.id },
          data: { 
            status: "FAILED",
            errorLog: err.message
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Published ${eventsToPublish.length} events, ${projectsToPublish.length} projects. Dispatched ${emailsSentCount} scheduled communications.`,
    });
  } catch (error: any) {
    console.error("Cron publish error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to run cron" },
      { status: 500 }
    );
  }
}
