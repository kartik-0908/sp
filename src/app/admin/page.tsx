"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState({ students: 0, todayAttendance: 0, materials: 0 });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user.role !== "admin" && status === "authenticated") router.push("/student");
  }, [session, status, router]);

  useEffect(() => {
    async function fetchStats() {
      const [studentsRes, materialsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/materials"),
      ]);
      const students = await studentsRes.json();
      const materials = await materialsRes.json();

      const today = new Date().toISOString().split("T")[0];
      const attendanceRes = await fetch(`/api/attendance?date=${today}`);
      const attendance = await attendanceRes.json();

      setStats({
        students: students.length || 0,
        todayAttendance: Array.isArray(attendance)
          ? attendance.filter((a: { status: string }) => a.status === "present").length
          : 0,
        materials: materials.length || 0,
      });
    }
    if (session?.user.role === "admin") fetchStats();
  }, [session]);

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500">
          <h3 className="text-gray-500 text-sm font-medium">Total Students</h3>
          <p className="text-3xl font-bold mt-2">{stats.students}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium">Present Today</h3>
          <p className="text-3xl font-bold mt-2">{stats.todayAttendance}</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium">Study Materials</h3>
          <p className="text-3xl font-bold mt-2">{stats.materials}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/students"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">👨‍🎓</div>
          <h3 className="text-lg font-semibold">Manage Students</h3>
          <p className="text-gray-500 text-sm mt-1">Create and manage student accounts</p>
        </Link>
        <Link
          href="/admin/attendance"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">📋</div>
          <h3 className="text-lg font-semibold">Mark Attendance</h3>
          <p className="text-gray-500 text-sm mt-1">Track daily student attendance</p>
        </Link>
        <Link
          href="/admin/materials"
          className="bg-white rounded-xl shadow p-6 hover:shadow-lg transition text-center"
        >
          <div className="text-4xl mb-3">📚</div>
          <h3 className="text-lg font-semibold">Study Materials</h3>
          <p className="text-gray-500 text-sm mt-1">Upload materials for students</p>
        </Link>
      </div>
    </div>
  );
}
