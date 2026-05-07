"use client";

import { useEffect, useMemo, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { api } from "@/lib/api";
import { getToken } from "@/lib/auth";
import { getSocket } from "@/lib/socket";
import type { Message } from "@/lib/types";

interface ChatPanelProps {
  projectId: string;
}

export default function ChatPanel({ projectId }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [editingMessageId, setEditingMessageId] = useState<string>("");
  const [editingText, setEditingText] = useState<string>("");
  const [chatError, setChatError] = useState<string>("");

  const canEditMessage = (message: Message): boolean => {
    if (!currentUserId || String(message.sender?._id) !== String(currentUserId)) return false;
    const ageMs = Date.now() - new Date(message.createdAt).getTime();
    return ageMs <= 15 * 60 * 1000;
  };

  useEffect(() => {
    api.get(`/chat/${projectId}`).then((response) => setMessages(response.data.messages ?? []));
    api.get("/auth/me").then((response) => setCurrentUserId(String(response.data.user?._id ?? ""))).catch(() => undefined);
  }, [projectId]);

  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = getSocket(token);
    socket.emit("join-project", { projectId });

    socket.on("chat:new", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    socket.on("chat:updated", (updatedMessage: Message) => {
      setMessages((prev) =>
        prev.map((item) => (String(item._id) === String(updatedMessage._id) ? { ...item, ...updatedMessage } : item))
      );
      setEditingMessageId((prev) => (prev === updatedMessage._id ? "" : prev));
      setEditingText("");
    });

    socket.on("chat:error", ({ message }: { message: string }) => {
      setChatError(message);
    });

    socket.on("typing", ({ userId, isTyping }: { userId: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(userId) ? prev : [...prev, userId];
        }
        return prev.filter((item) => item !== userId);
      });
    });

    socket.on("presence:update", ({ users }: { users: string[] }) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("chat:new");
      socket.off("chat:updated");
      socket.off("chat:error");
      socket.off("typing");
      socket.off("presence:update");
    };
  }, [projectId]);

  const typingLabel = useMemo(() => {
    if (typingUsers.length === 0) return "";
    return "Someone is typing...";
  }, [typingUsers]);

  const sendMessage = () => {
    const token = getToken();
    if (!token || !text.trim()) return;

    const socket = getSocket(token);
    socket.emit("chat:send", { projectId, text: text.trim() });
    setText("");
    socket.emit("typing", { projectId, isTyping: false });
  };

  const saveEditedMessage = () => {
    const token = getToken();
    if (!token || !editingMessageId || !editingText.trim()) return;

    const socket = getSocket(token);
    setChatError("");
    socket.emit("chat:update", {
      projectId,
      messageId: editingMessageId,
      text: editingText.trim()
    }, (response: { ok: boolean; message?: Message; error?: string }) => {
      if (!response?.ok) {
        setChatError(response?.error ?? "Failed to update message");
        return;
      }

      if (response.message) {
        setMessages((prev) =>
          prev.map((item) =>
            String(item._id) === String(response.message?._id) ? { ...item, ...response.message } : item
          )
        );
      }

      setEditingMessageId("");
      setEditingText("");
    });
  };

  return (
    <div className="surface-panel fade-in rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h3 className="heading-font text-lg font-semibold text-slate-900">Project Chat</h3>
          <p className="text-xs text-slate-500">Realtime feed with edit window and presence</p>
        </div>
        <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
          Online: {onlineUsers.length}
        </span>
      </div>
      <div className="mb-3 h-72 space-y-3 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
        {messages.map((msg) => (
          <div key={msg._id} className="card-hover rounded-2xl border border-slate-200 bg-white p-3 text-sm shadow-[0_12px_24px_rgba(15,23,42,0.08)]">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium text-slate-900">{msg.sender?.name ?? "User"}</p>
              <p className="text-xs text-slate-500">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
            </div>
            {editingMessageId === msg._id ? (
              <div className="mt-1 space-y-2">
                <input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="glow-input w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-900"
                />
                <div className="flex gap-2">
                  <button onClick={saveEditedMessage} className="primary-button rounded-lg px-3 py-1.5 text-xs font-medium">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessageId("");
                      setEditingText("");
                    }}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 whitespace-pre-wrap leading-6 text-slate-600">{msg.text}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              {canEditMessage(msg) && editingMessageId !== msg._id && (
                <button
                  onClick={() => {
                    setEditingMessageId(msg._id);
                    setEditingText(msg.text);
                    setChatError("");
                  }}
                  className="text-xs font-medium text-sky-600 underline decoration-sky-200 underline-offset-4"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {chatError && <p className="mb-2 text-xs text-red-500">{chatError}</p>}
      <p className="mb-2 min-h-4 text-xs text-slate-500">{typingLabel}</p>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            const token = getToken();
            if (token) {
              const socket = getSocket(token);
              socket.emit("typing", { projectId, isTyping: event.target.value.length > 0 });
            }
          }}
          placeholder="Send a message"
          className="glow-input flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400"
        />
        <button onClick={sendMessage} className="primary-button rounded-xl px-4 py-3 font-medium">
          Send
        </button>
      </div>
    </div>
  );
}
