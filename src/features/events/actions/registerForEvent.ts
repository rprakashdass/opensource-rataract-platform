"use server";
import { revalidateTag } from "next/cache";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { dispatchNotification } from "@/features/notifications/service";

export async function registerForEvent(eventId: string, memberId: string) {
    try {
        const session = await getSession();
        if (!session || !session.id) return { error: "Unauthorized" };

        await prisma.$transaction(async (tx) => {
            // Row-level lock on the event to prevent concurrent registrations exceeding capacity
            const lockedEvents: any[] = await tx.$queryRaw`SELECT capacity, "registeredCount", status, "registrationEnabled" FROM "Event" WHERE id = ${eventId} FOR UPDATE`;
            if (!lockedEvents || lockedEvents.length === 0) {
                throw new Error("Event not found");
            }
            
            const lockedEvent = lockedEvents[0];
            
            if (lockedEvent.status === "CANCELLED" || lockedEvent.status === "COMPLETED") {
                throw new Error("Event is no longer accepting registrations");
            }
            if (!lockedEvent.registrationEnabled) {
                throw new Error("Registration is not open for this event");
            }
            if (lockedEvent.capacity && lockedEvent.registeredCount >= lockedEvent.capacity) {
                throw new Error("This event is full");
            }

            const existing = await tx.registration.findUnique({
                where: {
                    eventId_memberId: {
                        eventId,
                        memberId
                    }
                }
            });

            if (existing) {
                throw new Error("You are already registered");
            }

            await tx.registration.create({
                data: {
                    eventId,
                    memberId,
                    status: "REGISTERED"
                }
            });

            await tx.event.update({
                where: { id: eventId },
                data: { registeredCount: { increment: 1 } }
            });
        });

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
