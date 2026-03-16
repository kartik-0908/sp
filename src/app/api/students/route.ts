import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const students = await prisma.user.findMany({
    where: { role: "student" },
    select: { id: true, name: true, username: true, email: true, class: true, subject: true, phone: true, createdAt: true, plainPassword: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(students);
}

function generateUsername(name: string): string {
  const base = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, ".");
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `${base}.${suffix}`;
}

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, class: studentClass, subject } = body;

  if (!name || !studentClass || !subject) {
    return NextResponse.json({ error: "Name, class, and subject are required" }, { status: 400 });
  }

  const username = generateUsername(name);
  const plainPassword = generatePassword();
  const email = `${username}@successpoint.com`;

  try {
    const authRes = await auth.api.signUpEmail({
      body: {
        email,
        password: plainPassword,
        name,
      }
    });

    if (!authRes || !authRes.user) {
      return NextResponse.json({ error: "Failed to create authentication user" }, { status: 500 });
    }

    const student = await prisma.user.update({
      where: { id: authRes.user.id },
      data: {
        username: username,
        displayUsername: username,
        plainPassword: plainPassword,
        role: "student",
        class: studentClass,
        subject,
      },
      select: { id: true, name: true, username: true, class: true, subject: true },
    });

    return NextResponse.json(
      { ...student, plainPassword },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating student:", error);
    return NextResponse.json({ error: "Could not create student" }, { status: 500 });
  }
}
