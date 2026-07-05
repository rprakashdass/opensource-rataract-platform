import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const res = await prisma.announcement.findMany();
    console.log("Success:", res);
  } catch (err) {
    console.error("Error connecting:", err);
  } finally {
    // wait for it
  }
}

main();
