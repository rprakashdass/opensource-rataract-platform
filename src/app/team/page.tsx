import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { prisma } from "@/lib/prisma";
import { Metadata } from "next";
import TeamDirectory from "./_components/TeamDirectory";

export const metadata: Metadata = {
  title: "Team Directory",
  openGraph: {
    description: "Meet the executive board council and directors of our Rotaract organization.",
  },
};

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
        name: member.name || "Member",
        imageUrl: member.avatar || "/user.png",
        roles: [{
          id: member.id,
          memberType: member.boardMembership ? "COUNCIL" : "DIRECTOR",
          position: member.boardMembership?.position?.replaceAll("_", " ") || "Member",
          yearId: "y1"
        }]
      }));
    }
  } catch (error) {
    console.error("Prisma query failed on Team Page:", error);
  }

  let tenureYear: string | null = null;
  try {
    const club = await prisma.club.findFirst();
    if (club?.tenureYear) tenureYear = club.tenureYear;
  } catch (error) {
    console.error("Unable to load club tenure year:", error);
  }

  const finalMembers = dbMembers;

  return (
    <div className="min-h-screen bg-background pt-32 pb-16">
      <MaxWidthWrapper>
        <div className="space-y-12">
          {/* Header section */}
          <div className="max-w-2xl space-y-4">
            <span className="text-xs text-primary font-extrabold uppercase tracking-widest">
              Club Directory
            </span>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-foreground">
              Meet the Leaders of {tenureYear ? `Team ${tenureYear}` : "the Current Team"}
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
