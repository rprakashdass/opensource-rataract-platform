/**
 * Seed/refresh the standard Rotaract service portfolios for a club.
 * Non-destructive: only fills description/activities/icon when they're empty,
 * so any customized copy is preserved. Idempotent — safe to re-run.
 *
 *   npx tsx --env-file=.env.local scripts/seed-portfolios.ts
 *   CLUB_ID=<id> npx tsx --env-file=.env.local scripts/seed-portfolios.ts
 */
import { prisma } from "../src/lib/prisma";
import { getRoleResponsibilities } from "../src/lib/roleResponsibilities";

// name → Lucide icon. `roleKey` looks up the shared responsibilities copy.
const PORTFOLIOS = [
  { name: "Club Service", icon: "Users" },
  { name: "Community Service", icon: "HeartHandshake" },
  { name: "Professional Service", icon: "Briefcase" },
  { name: "International Service", icon: "Globe" },
  { name: "Blood Donor Cell", icon: "Droplet" },
  { name: "The Rotary Foundation", icon: "Landmark" },
];

async function main() {
  const clubId = process.env.CLUB_ID;
  const club = clubId
    ? await prisma.club.findUnique({ where: { id: clubId }, select: { id: true, name: true } })
    : await (async () => {
        const clubs = await prisma.club.findMany({ select: { id: true, name: true } });
        if (clubs.length === 1) return clubs[0];
        console.error(`Found ${clubs.length} clubs — set CLUB_ID explicitly:`, clubs);
        return null;
      })();

  if (!club) { process.exit(1); }
  console.log(`Target club: ${club.name} (${club.id})\n`);

  let order = await prisma.portfolio.count({ where: { clubId: club.id } });

  for (const p of PORTFOLIOS) {
    const resp = getRoleResponsibilities(p.name);
    const summary = resp?.summary ?? null;
    const activities = resp?.points ?? [];
    const existing = await prisma.portfolio.findFirst({ where: { clubId: club.id, name: p.name } });

    if (existing) {
      const existingActs = Array.isArray(existing.activities) ? (existing.activities as unknown[]) : [];
      await prisma.portfolio.update({
        where: { id: existing.id },
        data: {
          // preserve anything already customized
          description: existing.description?.trim() ? existing.description : summary,
          activities: existingActs.length ? (existing.activities as any) : activities,
          icon: existing.icon && existing.icon !== "Circle" ? existing.icon : p.icon,
          isActive: true,
        },
      });
      console.log(`updated  ${p.name}`);
    } else {
      await prisma.portfolio.create({
        data: {
          clubId: club.id, name: p.name, icon: p.icon,
          description: summary, activities, displayOrder: order++, isActive: true,
        },
      });
      console.log(`created  ${p.name}`);
    }
  }
  console.log("\nDone.");
  process.exit(0);
}
main();
