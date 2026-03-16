import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@successpoint.com" },
    update: {},
    create: {
      name: "Admin",
      email: "admin@successpoint.com",
      password: hashedPassword,
      role: "admin",
    },
  });

  console.log("Admin user created:", admin.email);

  // Create sample students
  const studentPassword = await bcrypt.hash("student123", 10);

  const student1 = await prisma.user.upsert({
    where: { email: "rahul@student.com" },
    update: {},
    create: {
      name: "Rahul Sharma",
      email: "rahul@student.com",
      password: studentPassword,
      role: "student",
      class: "9",
      phone: "9876543210",
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "priya@student.com" },
    update: {},
    create: {
      name: "Priya Patel",
      email: "priya@student.com",
      password: studentPassword,
      role: "student",
      class: "10",
      phone: "9876543211",
    },
  });

  console.log("Sample students created:", student1.email, student2.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
