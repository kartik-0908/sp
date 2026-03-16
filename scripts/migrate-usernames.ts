import { prisma } from "../src/lib/prisma";

async function main() {
  const students = await prisma.user.findMany({
    where: { role: "student" },
  });

  for (const student of students) {
    if (!student.username) {
      const email = student.email;
      let newEmail = email;
      let username = email;
      
      if (!email.includes("@")) {
         newEmail = `${email}@successpoint.com`;
      } else {
         username = email.split("@")[0] || email;
      }
      
      await prisma.user.update({
        where: { id: student.id },
        data: {
          username: username,
          displayUsername: student.name,
          email: newEmail,
        },
      });
      console.log(`Updated student ${student.email} -> username: ${username}, email: ${newEmail}`);
    }
  }
}

main().finally(() => prisma.$disconnect());
