import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const studentClass = searchParams.get("class");
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};

  if (date) {
    where.date = new Date(date);
  }

  if (userId) {
    where.userId = userId;
  } else if (session.user.role === "student") {
    where.userId = session.user.id;
  }

  if (studentClass) {
    where.user = { class: studentClass };
  }

  const attendance = await prisma.attendance.findMany({
    where,
    include: { user: { select: { name: true, email: true, class: true } } },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { date, records } = body as {
    date: string;
    records: { userId: string; status: string }[];
  };

  if (!date || !records || !Array.isArray(records)) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const attendanceDate = new Date(date);

  const results = await Promise.all(
    records.map((record) =>
      prisma.attendance.upsert({
        where: {
          userId_date: {
            userId: record.userId,
            date: attendanceDate,
          },
        },
        update: { status: record.status },
        create: {
          userId: record.userId,
          date: attendanceDate,
          status: record.status,
        },
      })
    )
  );

  return NextResponse.json(results);
}
