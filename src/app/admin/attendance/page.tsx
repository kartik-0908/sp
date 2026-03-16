"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
}

interface AttendanceRecord {
  userId: string;
  status: string;
}

export default function MarkAttendance() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClass, setSelectedClass] = useState("9");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user.role !== "admin" && status === "authenticated") router.push("/student");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") fetchStudents();
  }, [session]);

  useEffect(() => {
    if (session?.user.role === "admin") fetchExistingAttendance();
  }, [selectedDate, selectedClass, session]);

  async function fetchStudents() {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  }

  async function fetchExistingAttendance() {
    const classQuery = selectedClass === "all" ? "" : `&class=${selectedClass}`;
    const res = await fetch(`/api/attendance?date=${selectedDate}${classQuery}`);
    const data = await res.json();
    const existing: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((record: AttendanceRecord) => {
        existing[record.userId] = record.status;
      });
    }
    setAttendance(existing);
  }

  const filteredStudents = students.filter((s) => {
    const matchesClass = selectedClass === "all" || s.class === selectedClass;
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesClass && matchesSearch;
  });

  function toggleAttendance(studentId: string) {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: prev[studentId] === "present" ? "absent" : "present",
    }));
    setSaved(false);
  }

  function markAll(markStatus: string) {
    const newAttendance: Record<string, string> = {};
    filteredStudents.forEach((s) => {
      newAttendance[s.id] = markStatus;
    });
    setAttendance((prev) => ({ ...prev, ...newAttendance }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    const records = filteredStudents.map((s) => ({
      userId: s.id,
      status: attendance[s.id] || "absent",
    }));

    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: selectedDate, records }),
    });

    setSaving(false);
    setSaved(true);
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>

      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSaved(false); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search Student</label>
            <input
              type="text"
              placeholder="Name or email..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setSaved(false); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => { setSelectedClass(e.target.value); setSaved(false); }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => markAll("present")}
              className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 text-sm"
            >
              Mark All Present
            </button>
            <button
              onClick={() => markAll("absent")}
              className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 text-sm"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                  {searchQuery ? "No students found matching your search." : selectedClass === "all" ? "No students found." : `No students in Class ${selectedClass}.`}
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600">{student.email}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => toggleAttendance(student.id)}
                      className={`px-4 py-1 rounded-full text-sm font-medium ${
                        attendance[student.id] === "present"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {attendance[student.id] === "present" ? "Present" : "Absent"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {filteredStudents.length > 0 && (
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Attendance"}
          </button>
          {saved && <span className="text-green-600 font-medium">Attendance saved successfully!</span>}
        </div>
      )}
    </div>
  );
}
