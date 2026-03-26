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
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 p-5">
      <header className="mx-auto mb-5 flex w-full max-w-6xl items-center justify-between">
        <h1 className="text-3xl font-bold text-zinc-950">Dev Collab Dashboard</h1>
        <div className="flex items-center gap-2">
          <NotificationDropdown />
          <button
            className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm"
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
      <div className="mx-auto w-full max-w-6xl">
        <ProjectList
          projects={projects}
          currentUserId={currentUserId}
          onCreated={(project) => setProjects((prev) => [project, ...prev])}
          onUpdated={(project) =>
            setProjects((prev) => prev.map((item) => (item._id === project._id ? { ...item, ...project } : item)))
          }
        />
      </div>
    </main>
  );
}
