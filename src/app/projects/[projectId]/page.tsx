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
  const [activeTab, setActiveTab] = useState<"board" | "chat" | "snippets" | "ai">("board");

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
  const memberCount = project?.members?.length ?? 0;

  if (!project) {
    return <div className="flex min-h-screen items-center justify-center bg-transparent text-slate-500">Loading project...</div>;
  }

  return (
    <main className="min-h-screen bg-transparent p-4 text-slate-900 md:p-6">
      <div className="mx-auto grid max-w-7xl gap-5 xl:grid-cols-[260px_1fr_290px]">
        <aside className="surface-panel fade-in rounded-2xl p-4 xl:sticky xl:top-6 xl:h-[calc(100vh-3rem)] xl:overflow-auto">
          <button onClick={() => router.push("/dashboard")} className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">
            Back to Dashboard
          </button>
          <div className="mb-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Workspace</p>
            <h1 className="heading-font text-2xl font-semibold tracking-tight text-slate-900">{project.name}</h1>
            <p className="text-sm leading-6 text-slate-500">{project.description}</p>
          </div>
          <div className="mb-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Role</p>
              <p className="mt-1 font-medium text-slate-900">{currentUserRole}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-xs text-slate-500">Members</p>
              <p className="mt-1 font-medium text-slate-900">{memberCount}</p>
            </div>
          </div>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">Members</h2>
            <div className="space-y-2">
              {project.memberRoles?.map((entry) => (
                <div key={entry.user._id} className="card-hover rounded-xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{entry.user.name}</p>
                      <p className="text-xs text-slate-500">{entry.user.email}</p>
                    </div>
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {entry.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </aside>

        <section className="space-y-5">
          <header className="surface-panel fade-in rounded-2xl p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-sky-600">Project Workspace</p>
                <h2 className="heading-font mt-2 text-3xl font-semibold tracking-tight text-slate-900">Command surface</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                  Switch between board, chat, snippets, and AI in one dense interface tuned for speed.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-medium">
                {(["board", "chat", "snippets", "ai"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full border px-3 py-2 uppercase tracking-[0.2em] transition ${
                      activeTab === tab
                        ? "border-sky-200 bg-sky-50 text-sky-700"
                        : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          </header>

          <section className="surface-panel fade-in rounded-2xl p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="heading-font text-lg font-semibold text-slate-900">
                  {activeTab === "board" ? "Task Board" : activeTab === "chat" ? "Chat Stream" : activeTab === "snippets" ? "Code Snippets" : "AI Assistant"}
                </h3>
                <p className="text-xs text-slate-500">
                  {activeTab === "board"
                    ? "Drag cards between lanes to update status."
                    : activeTab === "chat"
                      ? "Realtime messages with edit window and presence."
                      : activeTab === "snippets"
                        ? "Store, copy, and explain code blocks."
                        : "Prompt-driven generation and code explanation."}
                </p>
              </div>
            </div>

            {activeTab === "board" && (
              <>
                <div className="grid gap-2 md:grid-cols-4">
                  <input
                    value={newTask.title}
                    onChange={(event) => setNewTask((prev) => ({ ...prev, title: event.target.value }))}
                    placeholder="Task title"
                    className="glow-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400"
                  />
                  <input
                    value={newTask.description}
                    onChange={(event) => setNewTask((prev) => ({ ...prev, description: event.target.value }))}
                    placeholder="Task description"
                    className="glow-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900 placeholder:text-slate-400"
                  />
                  <select
                    value={newTask.assignedTo}
                    onChange={(event) => setNewTask((prev) => ({ ...prev, assignedTo: event.target.value }))}
                    className="glow-input rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-slate-900"
                  >
                    <option value="">Assign later</option>
                    {project.members?.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                  <button onClick={createTask} className="primary-button rounded-xl px-3 py-2.5 font-medium">
                    Add Task
                  </button>
                </div>
                {taskError && <p className="mt-3 text-sm text-red-500">{taskError}</p>}
                <div className="mt-4">
                  <KanbanBoard tasks={tasks} onStatusChange={updateTaskStatus} />
                </div>
              </>
            )}

            {activeTab === "chat" && <ChatPanel projectId={projectId} />}
            {activeTab === "snippets" && <SnippetPanel projectId={projectId} />}
            {activeTab === "ai" && <SnippetPanel projectId={projectId} />}
          </section>
        </section>

        <aside className="space-y-5">
          <TimelinePanel projectId={projectId} />
          <div className="surface-panel fade-in rounded-2xl p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Signals</p>
            <div className="mt-4 grid gap-3 text-sm text-slate-400">
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-900">{tasks.length} tasks tracked</p>
                <p className="mt-1 text-xs text-slate-500">Board is ready for drag-and-drop updates.</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-3">
                <p className="text-slate-900">{memberCount} members online-ready</p>
                <p className="mt-1 text-xs text-slate-500">Presence indicators surface inside member list and chat.</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
