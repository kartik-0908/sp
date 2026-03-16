import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.user.updateMany({
    where: { email: "admin@successpoint.com" },
    data: { username: "admin", displayUsername: "admin" }
  });
  console.log("Updated admin username to 'admin'");
}

main().finally(() => prisma.$disconnect());
