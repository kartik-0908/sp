import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { put } from "@vercel/blob";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const materialClass = searchParams.get("class");
  const subject = searchParams.get("subject");

  const where: Record<string, unknown> = {};

  if (session.user.role === "student") {
    where.class = session.user.class;
  } else if (materialClass) {
    where.class = materialClass;
  }

  if (subject) {
    where.subject = subject;
  }

  const materials = await prisma.material.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(materials);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const title = formData.get("title") as string;
  const materialClass = formData.get("class") as string;
  const subject = formData.get("subject") as string;
  const file = formData.get("file") as File;

  if (!title || !materialClass || !subject || !file) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const blob = await put(`materials/${Date.now()}-${file.name}`, file, {
    access: "public",
  });

  const material = await prisma.material.create({
    data: {
      title,
      class: materialClass,
      subject,
      fileName: file.name,
      filePath: blob.url,
      fileSize: file.size,
    },
  });

  return NextResponse.json(material, { status: 201 });
}
