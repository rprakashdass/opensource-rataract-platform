import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

export async function getMemberProjects() {
    try {
        const session = await getSession();
        if (!session || !session.id) return { error: "Unauthorized" };

        const member = await prisma.member.findUnique({
            where: { userId: session.id },
            include: { club: true }
        });

        if (!member) return { error: "Member profile not found." };

        const allProjects = await prisma.project.findMany({
            where: { clubId: member.clubId },
            include: {
                members: {
                    include: { member: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        const available: any[] = [];
        const joined: any[] = [];

        allProjects.forEach(project => {
            const membership = project.members.find((m: any) => m.memberId === member.id);
            if (membership) {
                joined.push({ ...project, myRole: membership.role });
            } else {
                available.push(project);
            }
        });

        return { 
            available, 
            joined,
            memberId: member.id
        };
    } catch (error: any) {
        console.error("Fetch member projects error:", error);
        return { error: "Failed to load projects." };
    }
}
