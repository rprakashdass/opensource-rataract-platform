import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getMemberEvents() {
    try {
        const session = await getSession();
        if (!session || !session.id) return { error: "Unauthorized" };

        const member = await prisma.member.findUnique({
            where: { userId: session.id },
            include: { club: true }
        });

        if (!member) return { error: "Member profile not found." };

        // Fetch all events for the club
        const allEvents = await prisma.event.findMany({
            where: { 
                clubId: member.clubId,
                publishStatus: "PUBLISHED"
            },
            include: {
                registrations: {
                    where: { memberId: member.id }
                },
                attendance: {
                    where: { memberId: member.id }
                },
                attendanceSessions: {
                    where: { 
                        active: true,
                        expiresAt: { gt: new Date() }
                    }
                }
            },
            orderBy: { startDate: 'desc' }
        });

        const available: any[] = [];
        const registered: any[] = [];
        const checkInAvailable: any[] = [];
        const attended: any[] = [];
        const completed: any[] = []; 

        allEvents.forEach(event => {
            const isRegistered = event.registrations.length > 0;
            const hasAttended = event.attendance.length > 0;
            const eventEndTime = event.endTime 
                ? new Date(event.endTime) 
                : new Date(new Date(event.startTime).setHours(23, 59, 59, 999));
            const isPast = eventEndTime < new Date() || event.status === "COMPLETED";
            const hasActiveSession = event.attendanceSessions.length > 0;

            // Map event to its derived state
            let journeyState = "AVAILABLE";
            if (hasAttended) {
                journeyState = "ATTENDED";
                attended.push({ ...event, journeyState });
            } else if (isRegistered && hasActiveSession) {
                journeyState = "CHECK_IN_AVAILABLE";
                checkInAvailable.push({ ...event, journeyState });
            } else if (isRegistered && !isPast) {
                journeyState = "REGISTERED";
                registered.push({ ...event, journeyState });
            } else if (isPast) {
                journeyState = "COMPLETED";
                completed.push({ ...event, journeyState });
            } else {
                journeyState = "AVAILABLE";
                available.push({ ...event, journeyState });
            }
        });

        return { 
            available, 
            registered, 
            checkInAvailable,
            attended, 
            completed,
            memberId: member.id
        };
    } catch (error: any) {
        console.error("Fetch member events error:", error);
        return { error: "Failed to load events." };
    }
}
