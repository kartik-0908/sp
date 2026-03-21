import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { del } from "@vercel/blob";

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.user.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const material = await prisma.material.findUnique({ where: { id } });
  if (!material) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await del(material.filePath);
  } catch {
    // blob may already be deleted
  }

  await prisma.material.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
