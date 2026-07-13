import { prisma } from "./src/lib/prisma"; async function main() { console.log(await prisma.project.findFirst({where:{title:{contains:"Roots"}}})); } main();
