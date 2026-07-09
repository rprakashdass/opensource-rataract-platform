"use server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { dispatchNotification } from "@/features/notifications/service";

export async function registerForEvent(eventId: string, memberId: string) {
    try {
        const session = await getSession();
        if (!session || !session.id) return { error: "Unauthorized" };

        const event = await prisma.event.findUnique({
            where: { id: eventId }
        });

        if (!event) return { error: "Event not found" };
        if (event.status === "CANCELLED" || event.status === "COMPLETED") {
            return { error: "Event is no longer accepting registrations" };
        }
        if (!event.registrationEnabled) {
            return { error: "Registration is not open for this event" };
        }
        if (event.capacity && event.registeredCount >= event.capacity) {
            return { error: "This event is full" };
        }

        const existing = await prisma.registration.findUnique({
            where: {
                eventId_memberId: {
                    eventId,
                    memberId
                }
            }
        });

        if (existing) {
            return { error: "You are already registered" };
        }

        await prisma.$transaction([
            prisma.registration.create({
                data: {
                    eventId,
                    memberId,
                    status: "REGISTERED"
                }
            }),
            prisma.event.update({
                where: { id: eventId },
                data: { registeredCount: { increment: 1 } }
            })
        ]);

        // Try to get user email from member to send confirmation
        const member = await prisma.member.findUnique({
            where: { id: memberId },
            include: { user: true }
        });

        if (member?.user?.email) {
            await dispatchNotification({
                trigger: "ATTENDANCE_CONFIRMED",
                recipients: [member.user.email],
                eventId,
                sendEmailFlag: true,
                attachCalendarFlag: true
            });
        }

        revalidateTag("events", "max"); revalidateTag("homepage", "max");
    return { success: true };
    } catch (error: any) {
        console.error("Registration error:", error);
        return { error: error.message || "Registration failed" };
    }
}
