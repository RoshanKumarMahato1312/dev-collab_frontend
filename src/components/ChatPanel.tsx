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
    <div className="rounded-2xl border border-zinc-300 bg-white p-4 shadow-md shadow-zinc-300/30">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-950">Project Chat</h3>
        <span className="text-xs font-medium text-emerald-700">Online: {onlineUsers.length}</span>
      </div>
      <div className="mb-2 h-64 space-y-2 overflow-y-auto rounded-lg border border-zinc-300 bg-zinc-100 p-2">
        {messages.map((msg) => (
          <div key={msg._id} className="rounded-lg border border-zinc-200 bg-white p-2 text-sm">
            <p className="font-semibold text-zinc-900">{msg.sender?.name ?? "User"}</p>
            {editingMessageId === msg._id ? (
              <div className="mt-1 space-y-2">
                <input
                  value={editingText}
                  onChange={(event) => setEditingText(event.target.value)}
                  className="w-full rounded border border-zinc-300 px-2 py-1"
                />
                <div className="flex gap-2">
                  <button onClick={saveEditedMessage} className="rounded bg-zinc-900 px-2 py-1 text-xs text-white">
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingMessageId("");
                      setEditingText("");
                    }}
                    className="rounded border border-zinc-300 px-2 py-1 text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-zinc-800">{msg.text}</p>
            )}
            <div className="mt-1 flex items-center gap-2">
              <p className="text-xs text-zinc-500">{formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}</p>
              {canEditMessage(msg) && editingMessageId !== msg._id && (
                <button
                  onClick={() => {
                    setEditingMessageId(msg._id);
                    setEditingText(msg.text);
                    setChatError("");
                  }}
                  className="text-xs font-medium text-zinc-700 underline"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
      {chatError && <p className="mb-2 text-xs text-red-600">{chatError}</p>}
      <p className="mb-1 text-xs text-zinc-600">{typingLabel}</p>
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
          className="flex-1 rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2"
        />
        <button onClick={sendMessage} className="rounded-lg bg-zinc-950 px-3 py-2 font-medium text-white">
          Send
        </button>
      </div>
    </div>
  );
}
