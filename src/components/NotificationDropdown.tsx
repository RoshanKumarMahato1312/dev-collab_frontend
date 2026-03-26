"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { Notification } from "@/lib/types";

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.filter((item) => !item.read).length;

  const loadNotifications = async () => {
    const response = await api.get("/notifications");
    setNotifications(response.data.notifications ?? []);
  };

  useEffect(() => {
    loadNotifications().catch(() => undefined);
  }, []);

  const markAsRead = async (notificationId: string) => {
    await api.patch(`/notifications/${notificationId}/read`);
    setNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, read: true } : item)));
  };

  return (
    <div className="relative">
      <button
        className="rounded-lg border border-zinc-400 bg-white px-3 py-2 text-sm font-medium text-zinc-900 shadow-sm"
        onClick={() => setOpen((prev) => !prev)}
      >
        Notifications ({unreadCount})
      </button>
      {open && (
        <div className="absolute right-0 z-10 mt-2 w-80 rounded-xl border border-zinc-300 bg-white p-2 shadow-lg">
          {notifications.length === 0 && <p className="p-2 text-sm text-zinc-500">No notifications</p>}
          {notifications.map((item) => (
            <button
              key={item._id}
              className={`mb-1 w-full rounded-lg p-2 text-left text-sm text-zinc-900 ${item.read ? "bg-zinc-100" : "bg-emerald-100"}`}
              onClick={() => markAsRead(item._id)}
            >
              <p>{item.message}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
