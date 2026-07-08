import { getPublicTeam } from "@/features/public/queries/getPublicTeam";
import MaxWidthWrapper from "@/components/wrappers/MaxWidthWrapper";
import { PersonCard } from "@/components/ui/public/PersonCard";
import { PublicHero } from "@/components/ui/public/PublicHero";
import { PublicSection } from "@/components/ui/public/PublicSection";

export default async function TeamPage() {
  const data = await getPublicTeam();

  if (data.error) {
    return <div className="p-20 text-center text-slate-500 font-medium">Failed to load team data.</div>;
  }

  const board = data.board || [];
  const members = data.members || [];

  return (
    <main className="min-h-screen bg-background pb-16">
      <PublicHero 
        badge="Meet The Team"
        title="Members Directory"
        description="We are a dedicated community of volunteers, professionals, and students united by a shared passion for service and leadership."
      />
      <PublicSection background="white">
        
        {/* Unified Club Members */}
        <section>
          {members.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-6 gap-y-10">
              {members.map((member: any) => {
                const activeBoard = member.boardMemberships?.find((b: any) => b.financialYear?.status === "ACTIVE" || !b.leftAt);
                const boardRole = activeBoard?.position;
                
                return (
                  <PersonCard
                    key={member.id}
                    name={member.name}
                    avatarUrl={member.avatar}
                    professionOrYear={member.profession}
                    boardRole={boardRole}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-32 bg-white rounded-3xl border border-dashed border-slate-200 max-w-3xl mx-auto">
              <h3 className="text-2xl font-black text-slate-900 mb-2">No Members Found</h3>
              <p className="text-slate-500 font-medium">The club roster is currently empty.</p>
            </div>
          )}
        </section>

      </PublicSection>
    </main>
  );
}
