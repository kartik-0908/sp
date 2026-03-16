"use client";

import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function StudentMaterials() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [filterSubject, setFilterSubject] = useState("all");

  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
    if (!isPending && session && session.user.role === "admin") router.push("/admin");
  }, [session, isPending, router]);

  useEffect(() => {
    async function fetchMaterials() {
      const res = await fetch("/api/materials");
      const data = await res.json();
      if (Array.isArray(data)) setMaterials(data);
    }
    if (session?.user.role === "student") fetchMaterials();
  }, [session]);

  const filteredMaterials = materials.filter((m) => {
    if (filterSubject !== "all" && m.subject !== filterSubject) return false;
    return true;
  });

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  if (isPending) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Study Materials</h1>
      <p className="text-gray-600 mb-6">Class {session?.user.class} - Math & Science</p>

      {selectedMaterial && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">{selectedMaterial.title}</h2>
              <button
                onClick={() => setSelectedMaterial(null)}
                className="text-gray-500 hover:text-gray-800 p-2"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 bg-gray-100">
              <iframe
                src={`${selectedMaterial.filePath}#toolbar=0`}
                className="w-full h-full border-0"
                title={selectedMaterial.title}
              />
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500 bg-white rounded-xl shadow">
            No study materials available yet.
          </div>
        ) : (
          filteredMaterials.map((material) => (
            <div key={material.id} className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold text-lg mb-3">{material.title}</h3>
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
              <p className="text-gray-400 text-xs mb-3">
                Uploaded: {new Date(material.createdAt).toLocaleDateString("en-IN")}
              </p>
              <button
                onClick={() => setSelectedMaterial(material)}
                className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm"
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
