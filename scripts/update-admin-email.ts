import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.user.updateMany({
    where: { email: "admin" },
    data: { email: "admin@successpoint.com" }
  });
  console.log("Updated admin email to admin@successpoint.com");
}

main().finally(() => prisma.$disconnect());
