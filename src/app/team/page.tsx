import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { currentYear } from "@/lib/utils";
import { MemberType, Position } from "@/utils/positions";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import TeamDirectory from "./_components/TeamDirectory";

export const metadata: Metadata = {
  title: "Team Directory",
  openGraph: {
    description: "Meet the executive board council and directors of our Rotaract organization.",
  },
};

const mockCouncil = [
  {
    id: "c1",
    name: "Aarav Sharma",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
    roles: [{ id: "r1", memberType: "COUNCIL", position: "President", yearId: "y1" }]
  },
  {
    id: "c2",
    name: "Diya Patel",
    imageUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=300",
    roles: [{ id: "r2", memberType: "COUNCIL", position: "Secretary", yearId: "y1" }]
  },
  {
    id: "c3",
    name: "Kabir Singh",
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
    roles: [{ id: "r3", memberType: "COUNCIL", position: "Treasurer", yearId: "y1" }]
  }
];

const mockDirectors = [
  {
    id: "d1",
    name: "Neha Gupta",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
    roles: [{ id: "rd1", memberType: "DIRECTOR", position: "Club Service", yearId: "y1" }]
  },
  {
    id: "d2",
    name: "Rohan Verma",
    imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    roles: [{ id: "rd2", memberType: "DIRECTOR", position: "Community Service", yearId: "y1" }]
  }
];

export default async function TeamPage() {
  let dbMembers: any[] = [];
  try {
    const membersList = await prisma.member.findMany({
      include: {
        user: true,
        boardMembership: true
      }
    });

    if (membersList.length > 0) {
      dbMembers = membersList.map((member) => ({
        id: member.id,
        name: member.user?.name || "Member",
        imageUrl: member.user?.avatar || "/user.png",
        roles: [{
          id: member.id,
          memberType: member.role === "BOARD_MEMBER" ? "COUNCIL" : "DIRECTOR",
          position: member.boardMembership?.position?.replaceAll("_", " ") || "Member",
          yearId: "y1"
        }]
      }));
    }
  } catch (error) {
    console.warn("Prisma query failed on Team Page, using mock fallback:", error);
  }

  let tenureYear = "2026-27";
  try {
    const club = await prisma.club.findFirst();
    if (club?.tenureYear) tenureYear = club.tenureYear;
  } catch (e) {}

  const finalMembers = dbMembers.length > 0 ? dbMembers : [...mockCouncil, ...mockDirectors];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header section */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Club Directory
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Meet the Leaders of Team {tenureYear}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We structure our organization with a Board of Directors leading operational domains, and active members executing our community service projects.
            </p>
          </div>

          {/* Interactive team search & filters dashboard */}
          <TeamDirectory initialMembers={finalMembers} />
        </div>
      </MaxWidthWrapper>
    </div>
  );
}
