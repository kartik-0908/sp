"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StudentDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ totalDays: 0, presentDays: 0, materials: 0 });

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && session.user.role === "admin") router.push("/admin");
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchStats() {
      const [attendanceRes, materialsRes] = await Promise.all([
        fetch("/api/attendance"),
        fetch("/api/materials"),
      ]);
      const attendance = await attendanceRes.json();
      const materials = await materialsRes.json();

      setStats({
        totalDays: Array.isArray(attendance) ? attendance.length : 0,
        presentDays: Array.isArray(attendance)
          ? attendance.filter((a: { status: string }) => a.status === "present").length
          : 0,
        materials: Array.isArray(materials) ? materials.length : 0,
      });
    }
    if (session?.user.role === "student") fetchStats();
  }, [session]);

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  const attendancePercent = stats.totalDays > 0
    ? Math.round((stats.presentDays / stats.totalDays) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome, {session?.user.name}!</h1>
      <p className="text-gray-600 mb-8">Class {session?.user.class} Student</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Attendance</h3>
          <p className="text-3xl font-bold mt-2">{attendancePercent}%</p>
          <p className="text-sm text-gray-500 mt-1">{stats.presentDays}/{stats.totalDays} days present</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm font-medium">Days Present</h3>
          <p className="text-3xl font-bold mt-2">{stats.presentDays}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Study Materials</h3>
          <p className="text-3xl font-bold mt-2">{stats.materials}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/student/attendance"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold">My Attendance</h3>
          <p className="text-gray-500 text-sm mt-1">View your attendance history</p>
        </Link>
        <Link
          href="/student/materials"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold">Study Materials</h3>
          <p className="text-gray-500 text-sm mt-1">Download study materials for your class</p>
        </Link>
      </div>
    </div>
  );
}
