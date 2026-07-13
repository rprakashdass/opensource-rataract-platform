import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import ProfileJourneyClient from "./_components/ProfileJourneyClient";

export const dynamic = "force-dynamic";

export default async function MemberProfilePage() {
    const session = await getSession();
    if (!session || !session.id) redirect("/auth/login");

    const member = await prisma.member.findUnique({
        where: { userId: session.id },
        include: {
            club: true,
            boardMemberships: {
                include: { financialYear: true },
                orderBy: { joinedAt: 'desc' }
            },
            projectRoles: {
                include: { project: true },
                orderBy: { joinedAt: 'desc' }
            },
            eventRoles: {
                include: { event: true },
                orderBy: { joinedAt: 'desc' }
            },
            registrations: {
                include: {
                    event: {
                        include: { media: true }
                    }
                },
                orderBy: { createdAt: 'desc' }
            },
            attendance: {
                include: {
                    event: {
                        include: { media: true }
                    }
                },
                orderBy: { checkedInAt: 'desc' }
            }
        }
    });

    if (!member) {
        return <div className="text-center py-20 text-slate-500">Profile not found.</div>;
    }

    const serializedMember = JSON.parse(JSON.stringify(member));

    return <ProfileJourneyClient member={serializedMember} user={session} />;
}
