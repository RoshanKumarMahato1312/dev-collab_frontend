"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import KanbanBoard from "@/components/KanbanBoard";
import ChatPanel from "@/components/ChatPanel";
import SnippetPanel from "@/components/SnippetPanel";
import TimelinePanel from "@/components/TimelinePanel";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import type { Project, ProjectMemberRole, Task, User } from "@/lib/types";

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const router = useRouter();
  const projectId = params.projectId;

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [newTask, setNewTask] = useState({ title: "", description: "", assignedTo: "" });
  const [inviteUserId, setInviteUserId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "member">("member");
  const [taskError, setTaskError] = useState("");

  const loadData = async () => {
    const [projectRes, taskRes] = await Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/tasks/${projectId}`)
    ]);

    setProject({ ...projectRes.data.project, currentUserRole: projectRes.data.currentUserRole });
    setTasks(taskRes.data.tasks ?? []);
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    loadData().catch(() => router.replace("/dashboard"));
  }, [projectId, router]);

  const createTask = async () => {
    if (!newTask.title.trim()) return;
    setTaskError("");
    try {
      const response = await api.post(`/tasks/${projectId}`, {
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo || undefined
      });
      setTasks((prev) => [response.data.task, ...prev]);
      setNewTask({ title: "", description: "", assignedTo: "" });
    } catch (error: any) {
      setTaskError(error?.response?.data?.message ?? "Failed to create task");
    }
  };

  const updateTaskStatus = async (taskId: string, status: "todo" | "in-progress" | "done") => {
    const response = await api.patch(`/tasks/item/${taskId}`, { status });
    setTasks((prev) => prev.map((item) => (item._id === taskId ? response.data.task : item)));
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) return;
    const response = await api.get(`/users/search?query=${encodeURIComponent(searchQuery)}`);
    setUsers(response.data.users ?? []);
  };

  const inviteUser = async () => {
    if (!inviteUserId) return;
    await api.post(`/projects/${projectId}/invite`, { userId: inviteUserId, role: inviteRole });
    setInviteUserId("");
    await loadData();
  };

  const changeMemberRole = async (memberId: string, role: "admin" | "member") => {
    await api.patch(`/projects/${projectId}/members/${memberId}/role`, { role });
    await loadData();
  };

  const currentUserRole = project?.currentUserRole ?? "member";

  if (!project) {
    return <div className="flex min-h-screen items-center justify-center">Loading project...</div>;
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-100 to-zinc-200 p-4">
      <div className="mx-auto max-w-7xl space-y-4">
        <header className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-md shadow-zinc-300/40">
          <h1 className="text-3xl font-bold text-zinc-950">{project.name}</h1>
          <p className="text-sm text-zinc-700">{project.description}</p>
          <button onClick={() => router.push("/dashboard")} className="mt-2 text-sm font-medium text-zinc-900 underline">
            Back to Dashboard
          </button>
        </header>

        <section className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-md shadow-zinc-300/30">
          <h2 className="mb-3 text-lg font-semibold text-zinc-950">Invite Members</h2>
          <div className="flex flex-wrap gap-2">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            />
            <button onClick={searchUsers} className="rounded-lg bg-zinc-950 px-3 py-2 font-medium text-white">
              Search
            </button>
            <select
              value={inviteUserId}
              onChange={(event) => setInviteUserId(event.target.value)}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            >
              <option value="">Select user</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
            <select
              value={inviteRole}
              onChange={(event) => setInviteRole(event.target.value as "admin" | "member")}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button onClick={inviteUser} className="rounded-lg border border-zinc-400 bg-white px-3 py-2 font-medium text-zinc-900">
              Invite
            </button>
          </div>
          <div className="mt-4 rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <p className="mb-2 text-sm font-semibold text-zinc-900">Member Roles</p>
            <div className="space-y-2">
              {project.memberRoles?.map((entry) => (
                <div key={entry.user._id} className="flex items-center justify-between rounded border border-zinc-200 bg-white px-3 py-2">
                  <span className="text-sm text-zinc-800">
                    {entry.user.name} ({entry.user.email})
                  </span>
                  <select
                    value={entry.role}
                    onChange={(event) => changeMemberRole(entry.user._id, event.target.value as "admin" | "member")}
                    className="rounded border border-zinc-300 px-2 py-1 text-sm"
                    disabled={currentUserRole !== "owner" || entry.user._id === project.owner._id}
                  >
                    <option value="admin">Admin</option>
                    <option value="member">Member</option>
                  </select>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-zinc-300 bg-white p-5 shadow-md shadow-zinc-300/30">
          <h2 className="mb-3 text-lg font-semibold text-zinc-950">Create Task</h2>
          <div className="grid gap-2 md:grid-cols-4">
            <input
              value={newTask.title}
              onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Task title"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            />
            <input
              value={newTask.description}
              onChange={(event) => setNewTask((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Task description"
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            />
            <select
              value={newTask.assignedTo}
              onChange={(event) => setNewTask((prev) => ({ ...prev, assignedTo: event.target.value }))}
              className="rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
            >
              <option value="">Assign later</option>
              {project.members?.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
            <button onClick={createTask} className="rounded-lg bg-zinc-950 px-3 py-2 font-medium text-white">
              Add Task
            </button>
          </div>
          {taskError && <p className="mt-2 text-sm text-red-600">{taskError}</p>}
          <div className="mt-4">
            <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChatPanel projectId={projectId} />
          <SnippetPanel projectId={projectId} />
        </section>

        <section>
          <TimelinePanel projectId={projectId} />
        </section>
      </div>
    </main>
  );
}
