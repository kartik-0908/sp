"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";

export default function Navbar() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) return null;

  const isAdmin = session.user.role === "admin";

  async function handleSignOut() {
    await signOut();
    router.push("/login");
  }

  return (
    <nav className="bg-indigo-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href={isAdmin ? "/admin" : "/student"} className="text-xl font-bold">
              Success Point
            </Link>
            <div className="hidden md:flex gap-4">
              {isAdmin ? (
                <>
                  <Link href="/admin" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Dashboard
                  </Link>
                  <Link href="/admin/students" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Students
                  </Link>
                  <Link href="/admin/attendance" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Attendance
                  </Link>
                  <Link href="/admin/materials" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Materials
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/student" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Dashboard
                  </Link>
                  <Link href="/student/attendance" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    My Attendance
                  </Link>
                  <Link href="/student/materials" className="hover:bg-indigo-600 px-3 py-2 rounded-md text-sm">
                    Study Materials
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              {session.user.name} ({session.user.role})
            </span>
            <button
              onClick={handleSignOut}
              className="bg-indigo-800 hover:bg-indigo-900 px-3 py-2 rounded-md text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
