import { prisma } from "../src/lib/prisma";

// PaymentRequest used its own hardcoded TransactionCategory enum, separate
// from the FinanceCategory model Transaction already uses — two unrelated
// categorization systems for what's one ledger. This seeds one canonical
// FinanceCategory row per enum value and backfills PaymentRequest.categoryId
// from the old enum column. `category` itself is left untouched (dropped in
// a later, separate migration once nothing reads it).
//
// OTHER is intentionally NOT auto-mapped — it's used on both income-like and
// expense-like requests today with no reliable way to tell them apart, so
// those rows are left for manual review instead of a guessed classification.
const ENUM_TO_CATEGORY: Record<string, { name: string; type: "INCOME" | "EXPENSE" }> = {
  DUES: { name: "Dues", type: "INCOME" },
  EVENT_FEE: { name: "Event Fee", type: "INCOME" },
  DONATION: { name: "Donation", type: "INCOME" },
  SPONSORSHIP: { name: "Sponsorship", type: "INCOME" },
  CATERING: { name: "Catering", type: "EXPENSE" },
  LOGISTICS: { name: "Logistics", type: "EXPENSE" },
  MARKETING: { name: "Marketing", type: "EXPENSE" },
};

async function backfillPaymentRequestCategory() {
  const isDryRun = process.argv.includes("--dry-run");
  console.log(`Starting PaymentRequest category backfill${isDryRun ? " (DRY RUN)" : ""}...`);

  try {
    // Seed one FinanceCategory per enum value, keyed by the enum name as id
    // (matches the existing "categoryId doubles as a stable slug" convention
    // already used everywhere Transaction categories are created).
    for (const [enumValue, meta] of Object.entries(ENUM_TO_CATEGORY)) {
      if (isDryRun) {
        console.log(`  Would upsert FinanceCategory ${enumValue} (${meta.name}, ${meta.type})`);
      } else {
        await prisma.financeCategory.upsert({
          where: { id: enumValue },
          update: {},
          create: { id: enumValue, name: meta.name, type: meta.type },
        });
      }
    }

    const requests = await prisma.paymentRequest.findMany({
      where: { categoryId: null },
      select: { id: true, title: true, category: true },
    });
    console.log(`Found ${requests.length} payment request(s) without a categoryId.`);

    let updated = 0;
    const flaggedOther: string[] = [];

    for (const req of requests) {
      if (req.category === "OTHER" || !ENUM_TO_CATEGORY[req.category]) {
        flaggedOther.push(`  ${req.id} — "${req.title}" (${req.category})`);
        continue;
      }

      if (isDryRun) {
        console.log(`  Would set categoryId=${req.category} on request ${req.id} ("${req.title}")`);
      } else {
        await prisma.paymentRequest.update({ where: { id: req.id }, data: { categoryId: req.category } });
      }
      updated++;
    }

    console.log(`\n${isDryRun ? "Would update" : "Updated"} ${updated} payment request(s).`);
    if (flaggedOther.length > 0) {
      console.log(`\n${flaggedOther.length} request(s) need manual category assignment (OTHER or unrecognized):`);
      flaggedOther.forEach((line) => console.log(line));
    }
  } catch (err) {
    console.error("Backfill failed:", err);
  } finally {
    await prisma.$disconnect();
  }
}

backfillPaymentRequestCategory();
