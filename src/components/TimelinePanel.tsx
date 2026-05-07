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
    <div className="surface-panel fade-in rounded-2xl p-4">
      <h3 className="heading-font mb-2 text-lg font-semibold text-slate-900">Activity Timeline</h3>
      <p className="mb-4 text-xs text-slate-500">Recent workspace activity and audit trail.</p>
      <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-1">
        {activities.map((activity) => (
          <div key={activity._id} className="card-hover rounded-2xl border border-slate-200 bg-white p-3 text-sm">
            <p className="font-medium text-slate-900">
              {activity.actor?.name ?? "User"} {activity.action}
            </p>
            <p className="mt-1 text-xs text-slate-500">{formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}</p>
          </div>
        ))}
        {activities.length === 0 && <p className="text-sm text-slate-500">No activity yet.</p>}
      </div>
    </div>
  );
}
