"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationDropdown from "@/components/NotificationDropdown";
import ProjectList from "@/components/ProjectList";
import { api } from "@/lib/api";
import { clearToken, getToken } from "@/lib/auth";
import { disconnectSocket } from "@/lib/socket";
import type { Project } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }

    Promise.all([api.get("/projects"), api.get("/auth/me")]).then(([projectsRes, meRes]) => {
      setProjects(projectsRes.data.projects ?? []);
      setCurrentUserId(String(meRes.data.user?._id ?? ""));
    });
  }, [router]);

  return (
    <main className="min-h-screen bg-transparent p-4 text-slate-900 md:p-6">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <header className="surface-panel fade-in flex flex-col gap-4 rounded-2xl px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Dev Collab / Dashboard</p>
            <h1 className="heading-font mt-2 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">Command center</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <button
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-sky-300 hover:text-slate-900"
              onClick={() => {
                disconnectSocket();
                clearToken();
                router.push("/login");
              }}
            >
              Logout
            </button>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <aside className="surface-panel fade-in rounded-2xl p-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">Projects</h2>
              <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold text-sky-700">
                {projects.length}
              </span>
            </div>
            <div className="space-y-3">
              {projects.slice(0, 6).map((project) => (
                <button
                  key={project._id}
                  onClick={() => router.push(`/projects/${project._id}`)}
                  className="card-hover group w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-left hover:border-sky-200 hover:bg-sky-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2.5 w-2.5 rounded-full ${project.status === "completed" ? "bg-slate-400" : "bg-emerald-500"}`}
                        />
                        <p className="font-medium text-slate-900">{project.name}</p>
                      </div>
                      <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{project.description}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {project.status ?? "active"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-5">
            <div className="surface-panel fade-in rounded-2xl p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Project Creation</p>
                  <h2 className="heading-font mt-1 text-xl font-semibold text-slate-900">Create and manage active work</h2>
                </div>
                <p className="max-w-xl text-sm text-slate-500">
                  Dense workspace, live notifications, and fast access to current projects.
                </p>
              </div>
              <ProjectList
                projects={projects}
                currentUserId={currentUserId}
                onCreated={(project) => setProjects((prev) => [project, ...prev])}
                onUpdated={(project) =>
                  setProjects((prev) => prev.map((item) => (item._id === project._id ? { ...item, ...project } : item)))
                }
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
