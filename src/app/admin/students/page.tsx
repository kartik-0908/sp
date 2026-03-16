"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  subject: string | null;
  phone: string | null;
  createdAt: string;
}

interface CreatedStudent {
  name: string;
  email: string;
  plainPassword: string;
}

export default function ManageStudents() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    class: "9",
    subject: "both",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<CreatedStudent | null>(null);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loadingAttendance, setLoadingAttendance] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user.role !== "admin" && status === "authenticated") router.push("/student");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") {
      fetchStudents();
      fetchTodayAttendance();
    }
  }, [session]);

  async function fetchTodayAttendance() {
    const today = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/attendance?date=${today}`);
    const data = await res.json();
    const existing: Record<string, string> = {};
    if (Array.isArray(data)) {
      data.forEach((record: any) => {
        existing[record.userId] = record.status;
      });
    }
    setAttendance(existing);
  }

  async function markAttendance(studentId: string, status: string) {
    setLoadingAttendance((prev) => ({ ...prev, [studentId]: true }));
    const today = new Date().toISOString().split("T")[0];
    
    await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: today, records: [{ userId: studentId, status }] }),
    });

    setAttendance((prev) => ({ ...prev, [studentId]: status }));
    setLoadingAttendance((prev) => ({ ...prev, [studentId]: false }));
  }

  async function fetchStudents() {
    const res = await fetch("/api/students");
    const data = await res.json();
    setStudents(data);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    setLoading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Failed to create student");
      return;
    }

    const data = await res.json();
    setCreatedStudent({
      name: data.name,
      email: data.email,
      plainPassword: data.plainPassword,
    });
    setForm({ name: "", class: "9", subject: "both" });
    setShowForm(false);
    fetchStudents();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this student?")) return;

    await fetch(`/api/students/${id}`, { method: "DELETE" });
    fetchStudents();
  }

  function subjectLabel(subject: string | null) {
    if (subject === "math") return "Mathematics";
    if (subject === "science") return "Science";
    if (subject === "both") return "Math & Science";
    return "-";
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Students</h1>
        <button
          onClick={() => { setShowForm(!showForm); setCreatedStudent(null); }}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ Add Student"}
        </button>
      </div>

      {createdStudent && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-green-800 mb-3">Student Created Successfully!</h2>
          <p className="text-sm text-green-700 mb-4">
            Share these login credentials with the student. The password cannot be viewed again.
          </p>
          <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
            <p><span className="font-medium text-gray-700">Name:</span> {createdStudent.name}</p>
            <p><span className="font-medium text-gray-700">Username:</span> <code className="bg-gray-100 px-2 py-1 rounded">{createdStudent.email}</code></p>
            <p><span className="font-medium text-gray-700">Password:</span> <code className="bg-gray-100 px-2 py-1 rounded">{createdStudent.plainPassword}</code></p>
          </div>
          <button
            onClick={() => setCreatedStudent(null)}
            className="mt-4 text-green-700 hover:text-green-900 text-sm font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New Student</h2>
          <p className="text-sm text-gray-500 mb-4">
            Username and password will be auto-generated and shown after creation.
          </p>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="e.g. Rahul Sharma"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                value={form.class}
                onChange={(e) => setForm({ ...form, class: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="both">Math & Science (Both)</option>
                <option value="math">Mathematics Only</option>
                <option value="science">Science Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Creating..." : "Create Student"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Today&apos;s Attendance</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {students.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                  No students found. Click &quot;+ Add Student&quot; to create one.
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">{student.name}</td>
                  <td className="px-6 py-4 text-gray-600 font-mono text-sm">{student.email}</td>
                  <td className="px-6 py-4">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-sm">
                      Class {student.class}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm">
                      {subjectLabel(student.subject)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => markAttendance(student.id, "present")}
                        disabled={loadingAttendance[student.id]}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          attendance[student.id] === "present"
                            ? "bg-green-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-green-100 disabled:opacity-50"
                        }`}
                      >
                        P
                      </button>
                      <button
                        onClick={() => markAttendance(student.id, "absent")}
                        disabled={loadingAttendance[student.id]}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          attendance[student.id] === "absent"
                            ? "bg-red-600 text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-red-100 disabled:opacity-50"
                        }`}
                      >
                        A
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleDelete(student.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
