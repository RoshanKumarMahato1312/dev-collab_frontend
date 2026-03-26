"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";

interface ProjectListProps {
  projects: Project[];
  currentUserId: string;
  onCreated: (project: Project) => void;
  onUpdated: (project: Project) => void;
}

export default function ProjectList({ projects, currentUserId, onCreated, onUpdated }: ProjectListProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [completingId, setCompletingId] = useState<string>("");

  const createProject = async () => {
    if (!name.trim()) return;
    const response = await api.post("/projects", { name, description });
    onCreated(response.data.project);
    setName("");
    setDescription("");
  };

  const completeProject = async (projectId: string) => {
    setCompletingId(projectId);
    try {
      const response = await api.patch(`/projects/${projectId}/complete`);
      onUpdated(response.data.project);
    } finally {
      setCompletingId("");
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
      <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-md shadow-zinc-300/30">
        <h2 className="mb-3 text-lg font-semibold text-zinc-950">New Project</h2>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="mb-2 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Project description"
          className="mb-2 min-h-24 w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
        />
        <button onClick={createProject} className="rounded-lg bg-zinc-950 px-4 py-2 text-sm font-semibold text-white">
          Create
        </button>
      </div>

      <div className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-md shadow-zinc-300/30">
        <h2 className="mb-3 text-lg font-semibold text-zinc-950">Your Projects</h2>
        <div className="space-y-3">
          {projects.map((project) => {
            const canCloseProject =
              project.currentUserRole === "owner" ||
              project.currentUserRole === "admin" ||
              String(project.owner?._id ?? "") === String(currentUserId);

            return (
            <div
              key={project._id}
              className="w-full rounded-xl border border-zinc-300 bg-zinc-50 p-3 text-left transition hover:-translate-y-0.5 hover:bg-white hover:shadow-md"
            >
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-medium text-zinc-900">{project.name}</h3>
                <span
                  className={`rounded px-2 py-1 text-xs font-medium ${
                    project.status === "completed" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {project.status === "completed" ? "Completed" : "Active"}
                </span>
              </div>
              <p className="mb-3 text-sm text-zinc-600">{project.description}</p>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/projects/${project._id}`)}
                  className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-xs font-medium text-zinc-900"
                >
                  Open
                </button>
                {canCloseProject && project.status !== "completed" && (
                  <button
                    onClick={() => completeProject(project._id)}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-medium text-white"
                    disabled={completingId === project._id}
                  >
                    {completingId === project._id ? "Closing..." : "Close Project"}
                  </button>
                )}
              </div>
            </div>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-zinc-500">No projects yet.</p>}
        </div>
      </div>
    </div>
  );
}
