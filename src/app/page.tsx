import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import HeroSection from "./_components/HeroSection";
import PartnersSection from "./_components/PartnersSection";
import AboutSection from "./_components/AboutSection";
import EventsSection from "./_components/EventsSection";
import BoardCouncil from "./_components/BoardCouncil";
import { allPositions, MemberType, Position } from "@/utils/positions";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  let members: any[] = [];
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
    console.error("Prisma query failed on Home page:", error);
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
          {sortedMembers.length > 0 ? (
            <BoardCouncil members={sortedMembers} />
          ) : (
            <div className="rounded-3xl border border-dashed border-primary/20 bg-card/80 p-8 text-center text-sm text-muted-foreground">
              Leadership details will appear here once members are added to the database.
            </div>
          )}
        </MaxWidthWrapper>
      </div>
    </main>
  );
}
