import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) return null;

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      email: session.user.email,
      role: (session.user as Record<string, unknown>).role as string || "student",
      class: (session.user as Record<string, unknown>).class as string | null || null,
      subject: (session.user as Record<string, unknown>).subject as string | null || null,
    },
  };
}
