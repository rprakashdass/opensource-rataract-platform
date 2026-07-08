import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const club = await prisma.club.findFirst();
    console.log(club?.socialMedia);
}
main().catch(console.error).finally(() => prisma.$disconnect());
