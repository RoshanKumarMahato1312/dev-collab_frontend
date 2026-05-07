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
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <div className="surface-panel fade-in rounded-2xl p-5">
        <h2 className="heading-font mb-2 text-lg font-semibold text-slate-900">New Project</h2>
        <p className="mb-4 text-sm text-slate-500">Launch a new workspace card with status and activity tracking.</p>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Project name"
          className="glow-input mb-3 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400"
        />
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Project description"
          className="glow-input mb-3 min-h-28 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400"
        />
        <button onClick={createProject} className="primary-button rounded-xl px-4 py-2.5 text-sm font-semibold">
          Create
        </button>
      </div>

      <div className="surface-panel fade-in rounded-2xl p-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <h2 className="heading-font text-lg font-semibold text-slate-900">Your Projects</h2>
            <p className="text-sm text-slate-500">Active and completed workspaces at a glance.</p>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Live grid</span>
        </div>
        <div className="grid gap-3 xl:grid-cols-2">
          {projects.map((project) => {
            const canCloseProject =
              project.currentUserRole === "owner" ||
              project.currentUserRole === "admin" ||
              String(project.owner?._id ?? "") === String(currentUserId);

            return (
              <div
                key={project._id}
                className="card-hover group rounded-2xl border border-slate-200 bg-white p-4 hover:border-sky-200 hover:bg-sky-50"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          project.status === "completed"
                            ? "bg-slate-400"
                            : "bg-emerald-500"
                        }`}
                      />
                      <h3 className="font-medium text-slate-900">{project.name}</h3>
                    </div>
                    <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{project.description}</p>
                  </div>
                  <span
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-mono uppercase tracking-[0.2em] ${
                      project.status === "completed"
                        ? "border-slate-200 bg-slate-50 text-slate-500"
                        : "border-emerald-200 bg-emerald-50 text-emerald-600"
                    }`}
                  >
                    {project.status === "completed" ? "Completed" : "Active"}
                  </span>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>{project.members?.length ?? 0} members</span>
                  <span>{project.currentUserRole ?? "member"}</span>
                  <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : "recent"}</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => router.push(`/projects/${project._id}`)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-sky-200"
                  >
                    Open
                  </button>
                  {canCloseProject && project.status !== "completed" && (
                    <button
                      onClick={() => completeProject(project._id)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-medium text-rose-600 transition hover:bg-rose-100"
                      disabled={completingId === project._id}
                    >
                      {completingId === project._id ? "Closing..." : "Close Project"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {projects.length === 0 && <p className="text-sm text-slate-500">No projects yet.</p>}
        </div>
      </div>
    </div>
  );
}
