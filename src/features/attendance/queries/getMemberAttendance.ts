import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getMemberAttendance() {
    try {
        const session = await getSession();
        if (!session || !session.id) return { error: "Unauthorized" };

        const member = await prisma.member.findUnique({
            where: { userId: session.id },
            include: { club: true }
        });

        if (!member) return { error: "Member profile not found." };

        const history = await prisma.attendance.findMany({
            where: { memberId: member.id },
            include: {
                event: true
            },
            orderBy: { checkedInAt: 'desc' }
        });

        const totalHours = history.reduce((acc, curr) => acc + Number(curr.volunteerHours || 0), 0);
        const presentCount = history.filter(h => h.status === "PRESENT").length;
        const totalRecorded = history.length;
        const attendancePercentage = totalRecorded > 0 ? Math.round((presentCount / totalRecorded) * 100) : 0;

        return { 
            history,
            totalHours,
            attendancePercentage,
            memberId: member.id
        };
    } catch (error: any) {
        console.error("Fetch member attendance error:", error);
        return { error: "Failed to load attendance." };
    }
}
