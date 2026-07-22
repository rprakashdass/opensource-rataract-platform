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
        return (
            <div className="max-w-md mx-auto text-center py-24 px-6">
                <h2 className="text-xl font-bold text-ink">Profile not found</h2>
                <p className="text-sm text-ink-soft mt-2">
                    We couldn&rsquo;t load your member profile. Try refreshing, or contact your club admin if this keeps happening.
                </p>
            </div>
        );
    }

    const serializedMember = JSON.parse(JSON.stringify(member));

    return <ProfileJourneyClient member={serializedMember} user={session} />;
}
