"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import type { Activity } from "@/lib/types";

interface TimelinePanelProps {
  projectId: string;
}

export default function TimelinePanel({ projectId }: TimelinePanelProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    api.get(`/activity/${projectId}`).then((response) => {
      setActivities(response.data.activities ?? []);
    });
  }, [projectId]);

  return (
    <div className="rounded-2xl border border-zinc-300 bg-white p-4 shadow-md shadow-zinc-300/30">
      <h3 className="mb-3 text-lg font-semibold text-zinc-950">Activity Timeline</h3>
      <div className="max-h-80 space-y-2 overflow-y-auto">
        {activities.map((activity) => (
          <div key={activity._id} className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm">
            <p className="font-medium text-zinc-900">
              {activity.actor?.name ?? "User"} {activity.action}
            </p>
            <p className="text-xs text-zinc-600">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-zinc-600">No activity yet.</p>}
      </div>
    </div>
  );
}
