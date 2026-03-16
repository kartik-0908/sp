"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";

interface Material {
  id: string;
  title: string;
  class: string;
  subject: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

export default function ManageMaterials() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [materialClass, setMaterialClass] = useState("9");
  const [subject, setSubject] = useState("math");
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [filterClass, setFilterClass] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    if (session?.user.role !== "admin" && status === "authenticated") router.push("/student");
  }, [session, status, router]);

  useEffect(() => {
    if (session?.user.role === "admin") fetchMaterials();
  }, [session]);

  async function fetchMaterials() {
    const res = await fetch("/api/materials");
    const data = await res.json();
    setMaterials(data);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please select a file");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("class", materialClass);
    formData.append("subject", subject);
    formData.append("file", file);

    const res = await fetch("/api/materials", {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Upload failed");
      return;
    }

    setTitle("");
    setMaterialClass("9");
    setSubject("math");
    if (fileRef.current) fileRef.current.value = "";
    setShowForm(false);
    fetchMaterials();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this material?")) return;
    await fetch(`/api/materials/${id}`, { method: "DELETE" });
    fetchMaterials();
  }

  const filteredMaterials = materials.filter((m) => {
    if (filterClass !== "all" && m.class !== filterClass) return false;
    if (filterSubject !== "all" && m.subject !== filterSubject) return false;
    return true;
  });

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Study Materials</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
        >
          {showForm ? "Cancel" : "+ Upload Material"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Upload New Material</h2>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">{error}</div>
          )}
          <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class *</label>
              <select
                value={materialClass}
                onChange={(e) => setMaterialClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="9">Class 9</option>
                <option value="10">Class 10</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="math">Mathematics</option>
                <option value="science">Science</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">File *</label>
              <input
                type="file"
                ref={fileRef}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={uploading}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Class</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Classes</option>
              <option value="9">Class 9</option>
              <option value="10">Class 10</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Subject</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="all">All Subjects</option>
              <option value="math">Mathematics</option>
              <option value="science">Science</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-xl shadow">
            No materials found. Upload your first material above.
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-semibold text-lg">{material.title}</h3>
                <button
                  onClick={() => handleDelete(material.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                  Class {material.class}
                </span>
                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs capitalize">
                  {material.subject === "math" ? "Mathematics" : "Science"}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-3">
                {material.fileName} ({formatSize(material.fileSize)})
              </p>
              <a
                href={material.filePath}
                download
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
              >
                Download
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
