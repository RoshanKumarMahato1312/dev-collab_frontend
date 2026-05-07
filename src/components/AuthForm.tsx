"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { setToken } from "@/lib/auth";

type Mode = "login" | "signup";

interface AuthFormProps {
  mode: Mode;
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email, password } : { name, email, password };
      const response = await api.post(endpoint, payload);
      setToken(response.data.token);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={onSubmit}
      className="surface-panel w-full max-w-md space-y-5 rounded-3xl p-7"
    >
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-500">Secure Access</p>
        <h1 className="heading-font text-3xl font-semibold tracking-tight text-slate-900">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h1>
        <p className="text-sm leading-6 text-slate-500">
          Collaborate with your team in one workspace without losing context.
        </p>
      </div>
      {mode === "signup" && (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="glow-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400"
          required
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        className="glow-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="glow-input w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition placeholder:text-slate-400"
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        className="primary-button w-full rounded-xl px-4 py-3 font-semibold transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Syncing..." : mode === "login" ? "Enter Workspace" : "Create Workspace"}
      </button>
    </form>
  );
}
