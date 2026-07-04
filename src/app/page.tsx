import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import HeroSection from "./_components/HeroSection";
import PartnersSection from "./_components/PartnersSection";
import { Separator } from "@/components/ui/separator";
import AboutSection from "./_components/AboutSection";
import EventsSection from "./_components/EventsSection";
import BoardCouncil from "./_components/BoardCouncil";
import { currentYear } from "@/lib/utils";
import { allPositions, MemberType, Position } from "@/utils/positions";
import { prisma } from "@/lib/prisma";

// Static mock fallback in case Prisma database is not seeded/configured yet
const mockMembers = [
  {
    id: "m1",
    name: "Aditya Vardhan",
    imageUrl: "/user.png",
    roles: [{
      id: "r1",
      memberType: MemberType.COUNCIL,
      position: Position.PRESIDENT,
      yearId: "y1",
      memberId: "m1"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "m2",
    name: "Rohan Gupta",
    imageUrl: "/user.png",
    roles: [{
      id: "r2",
      memberType: MemberType.COUNCIL,
      position: Position.SECRETARY,
      yearId: "y1",
      memberId: "m2"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "m3",
    name: "Sneha Kapoor",
    imageUrl: "/user.png",
    roles: [{
      id: "r3",
      memberType: MemberType.COUNCIL,
      position: Position.VICE_PRESIDENT,
      yearId: "y1",
      memberId: "m3"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "m4",
    name: "Arjun Malhotra",
    imageUrl: "/user.png",
    roles: [{
      id: "r4",
      memberType: MemberType.COUNCIL,
      position: Position.SERGEANT_AT_ARMS,
      yearId: "y1",
      memberId: "m4"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "m5",
    name: "Nisha Singhal",
    imageUrl: "/user.png",
    roles: [{
      id: "r5",
      memberType: MemberType.COUNCIL,
      position: Position.TREASURER,
      yearId: "y1",
      memberId: "m5"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: "m6",
    name: "Vikram Sen",
    imageUrl: "/user.png",
    roles: [{
      id: "r6",
      memberType: MemberType.COUNCIL,
      position: Position.PUBLIC_RELATION_OFFICER,
      yearId: "y1",
      memberId: "m6"
    }],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

export default async function Home() {
  let members = mockMembers;
  try {
    const dbMembers = await prisma.member.findMany({
      include: {
        user: true,
        boardMembership: true
      },
    });
    if (dbMembers && dbMembers.length > 0) {
      members = dbMembers.map((m: any) => ({
        id: m.id,
        name: m.user?.name || "Member",
        imageUrl: m.user?.avatar || "/user.png",
        roles: [{
          id: m.id,
          memberType: (m.role === "BOARD_MEMBER" ? MemberType.COUNCIL : MemberType.DIRECTOR) as MemberType,
          position: (m.boardMembership?.position?.replaceAll("_", " ") || "Member") as Position,
          yearId: "y1",
          memberId: m.id
        }],
        createdAt: m.createdAt,
        updatedAt: m.updatedAt
      }));
    }
  } catch (error) {
    console.error("Prisma query failed on Home page, using fallback:", error);
  }

  // Sort members by their position and type
  const sortedMembers = [...members].sort((a: any, b: any) => {
    const order = ["COUNCIL", "DIRECTOR", "COORDINATOR", "MEMBER"];
    const aType = a.roles[0]?.memberType || "MEMBER";
    const bType = b.roles[0]?.memberType || "MEMBER";
    const typeComparison = order.indexOf(aType) - order.indexOf(bType);
    if (typeComparison !== 0) return typeComparison;

    if (aType === "COUNCIL" && bType === "COUNCIL") {
      const aPos = a.roles[0]?.position as Position;
      const bPos = b.roles[0]?.position as Position;
      return allPositions.indexOf(aPos) - allPositions.indexOf(bPos);
    }

    return 0;
  });

  return (
    <main className="min-h-screen w-full space-y-12 lg:space-y-24 py-8 lg:py-16 bg-background relative overflow-hidden">
      {/* Premium background blur glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      
      <div>
        <MaxWidthWrapper>
          <HeroSection />
        </MaxWidthWrapper>
      </div>
      <div className="border-y border-primary/10 bg-primary/5 py-8">
        <MaxWidthWrapper>
          <PartnersSection />
        </MaxWidthWrapper>
      </div>
      <div>
        <MaxWidthWrapper>
          <AboutSection />
        </MaxWidthWrapper>
      </div>
      <div className="bg-transparent py-12 border-y border-primary/10">
        <MaxWidthWrapper>
          <EventsSection />
        </MaxWidthWrapper>
      </div>
      <div>
        <MaxWidthWrapper>
          <BoardCouncil members={sortedMembers} />
        </MaxWidthWrapper>
      </div>
    </main>
  );
}
