"use client";

import { useMemo } from "react";
import type { Task } from "@/lib/types";

type TaskStatus = "todo" | "in-progress" | "done";

const columns: Array<{ key: TaskStatus; title: string }> = [
  { key: "todo", title: "Todo" },
  { key: "in-progress", title: "In Progress" },
  { key: "done", title: "Done" }
];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}

export default function KanbanBoard({ tasks, onStatusChange }: KanbanBoardProps) {
  const grouped = useMemo(() => {
    return {
      todo: tasks.filter((task) => task.status === "todo"),
      "in-progress": tasks.filter((task) => task.status === "in-progress"),
      done: tasks.filter((task) => task.status === "done")
    };
  }, [tasks]);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.key}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const taskId = event.dataTransfer.getData("task-id");
            if (taskId) onStatusChange(taskId, column.key);
          }}
          className="card-hover min-h-56 rounded-2xl border border-slate-200 bg-white p-3 hover:border-sky-200 hover:bg-sky-50"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500">{column.title}</h3>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] text-slate-500">
              {grouped[column.key].length}
            </span>
          </div>
          <div className="space-y-2">
            {grouped[column.key].map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("task-id", task._id)}
                className="card-hover cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-[0_12px_24px_rgba(15,23,42,0.08)] hover:border-sky-200"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
                </div>
                <p className="text-sm leading-6 text-slate-500">{task.description}</p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  {task.assignedTo ? <span>@{task.assignedTo.name}</span> : <span>Unassigned</span>}
                  {task.dueDate ? <span>{new Date(task.dueDate).toLocaleDateString()}</span> : <span>Flexible</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
