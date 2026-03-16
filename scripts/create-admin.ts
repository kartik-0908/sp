import "dotenv/config";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

async function main() {
  try {
    const res = await auth.api.signUpEmail({
      body: {
        email: "admin",
        password: "ishu@2001",
        name: "Admin"
      }
    });
    console.log("Admin created via better-auth:", res);
    
    // update role to admin
    if (res && res.user) {
      await prisma.user.update({
        where: { id: res.user.id },
        data: { role: "admin" }
      });
      console.log("Role updated to admin.");
    }

  } catch (error: any) {
    if (error.message && error.message.includes("email")) {
       console.log("Creating with fake email then updating it back to 'admin'");
       // Some versions might require email format 
       const res2 = await auth.api.signUpEmail({
         body: {
           email: "admin@example.com",
           password: "ishu@2001",
           name: "Admin",
         }
       });
       if (res2 && res2.user) {
         await prisma.user.update({
            where: { id: res2.user.id },
            data: { email: "admin", role: "admin" }
         });
         console.log("Admin created and updated role + email");
       }
    } else {
       console.error("Error creating admin:", error);
    }
  }
}

main().finally(() => prisma.$disconnect());
