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
        className="relative rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-sky-200"
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="pr-8">Notifications</span>
        <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sky-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          {unreadCount}
        </span>
      </button>
      {open && (
        <div className="absolute right-0 z-20 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_20px_50px_rgba(15,23,42,0.18)]">
          <div className="mb-2 flex items-center justify-between px-2 py-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Alerts</p>
            <span className="text-[10px] text-slate-500">Unread {unreadCount}</span>
          </div>
          {notifications.length === 0 && <p className="p-2 text-sm text-slate-500">No notifications</p>}
          {notifications.map((item) => (
            <button
              key={item._id}
              className={`mb-1 w-full rounded-xl border p-3 text-left text-sm transition ${
                item.read
                  ? "border-slate-200 bg-white text-slate-600"
                  : "border-sky-200 bg-sky-50 text-slate-700"
              }`}
              onClick={() => markAsRead(item._id)}
            >
              <p className="leading-5">{item.message}</p>
              <p className="mt-1 text-xs text-slate-500">{new Date(item.createdAt).toLocaleString()}</p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
