import { prisma } from "../src/lib/prisma";

// recordDirectPayment.ts used to set Transaction.memberId but never
// Transaction.userId — the member finance dashboard queries transactions by
// userId only, so every admin-recorded payment made before that fix is
// invisible to the member: missing from "Your Payment History", not counted
// in "Total Contributed", and the originating request still shows "pending".
// This backfills userId from Member.userId for every affected row.
async function backfillTransactionUserId() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`Starting transaction userId backfill${isDryRun ? " (DRY RUN)" : ""}...`);

  try {
    const affected = await prisma.transaction.findMany({
      where: { userId: null, memberId: { not: null } },
      select: { id: true, memberId: true, amount: true, description: true },
    });

    console.log(`Found ${affected.length} transaction(s) with a member but no linked user.`);

    if (affected.length === 0) {
      console.log("Nothing to do.");
      return;
    }

    const memberIds = [...new Set(affected.map((t) => t.memberId!))];
    const members = await prisma.member.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, userId: true, name: true },
    });
    const memberUserMap = new Map(members.map((m) => [m.id, m.userId]));

    let updated = 0;
    let skippedNoAccount = 0;

    for (const txn of affected) {
      const userId = memberUserMap.get(txn.memberId!);
      if (!userId) {
        // Member has no linked login account (e.g. never activated) —
        // nothing to backfill for them, there's no dashboard to show it on.
        skippedNoAccount++;
        continue;
      }

      if (isDryRun) {
        console.log(`  Would set userId=${userId} on transaction ${txn.id} (₹${txn.amount} — ${txn.description})`);
      } else {
        await prisma.transaction.update({ where: { id: txn.id }, data: { userId } });
      }
      updated++;
    }

    console.log(`\n${isDryRun ? "Would update" : "Updated"} ${updated} transaction(s).`);
    if (skippedNoAccount > 0) {
      console.log(`Skipped ${skippedNoAccount} transaction(s) whose member has no linked user account.`);
    }
  } catch (err) {
    console.error("Backfill failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

backfillTransactionUserId();
