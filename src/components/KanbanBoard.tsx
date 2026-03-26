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
    <div className="grid gap-4 md:grid-cols-3">
      {columns.map((column) => (
        <div
          key={column.key}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            const taskId = event.dataTransfer.getData("task-id");
            if (taskId) onStatusChange(taskId, column.key);
          }}
          className="min-h-56 rounded-xl border border-zinc-300 bg-zinc-100 p-3 shadow-sm"
        >
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-zinc-900">{column.title}</h3>
          <div className="space-y-2">
            {grouped[column.key].map((task) => (
              <div
                key={task._id}
                draggable
                onDragStart={(event) => event.dataTransfer.setData("task-id", task._id)}
                className="cursor-grab rounded-lg border border-zinc-300 bg-white p-3 shadow-sm"
              >
                <p className="font-semibold text-zinc-950">{task.title}</p>
                <p className="text-sm text-zinc-700">{task.description}</p>
                {task.assignedTo && <p className="mt-1 text-xs text-zinc-500">@{task.assignedTo.name}</p>}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
