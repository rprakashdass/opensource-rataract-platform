import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const club = await prisma.club.findFirst();
    if (!club) return;
    
    const members = await prisma.member.findMany({
        where: { clubId: club.id, isActive: true },
        select: { id: true, name: true, avatar: true }
    });
    
    const str = JSON.stringify(members);
    console.log(`Members count: ${members.length}`);
    console.log(`Total payload size: ${(str.length / 1024 / 1024).toFixed(2)} MB`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
