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
      className="w-full max-w-md space-y-4 rounded-2xl border border-zinc-300 bg-white p-7 shadow-lg shadow-zinc-300/40"
    >
      <h1 className="text-2xl font-bold text-zinc-950">{mode === "login" ? "Welcome back" : "Create account"}</h1>
      <p className="text-sm text-zinc-600">Collaborate with your team in one shared workspace.</p>
      {mode === "signup" && (
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Name"
          className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 outline-none ring-zinc-400 transition focus:ring-2"
          required
        />
      )}
      <input
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email"
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 outline-none ring-zinc-400 transition focus:ring-2"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Password"
        className="w-full rounded-lg border border-zinc-300 bg-zinc-50 px-3 py-2.5 outline-none ring-zinc-400 transition focus:ring-2"
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        className="w-full rounded-lg bg-zinc-950 px-4 py-2.5 font-semibold text-white transition hover:bg-zinc-800 disabled:opacity-60"
        disabled={loading}
      >
        {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign up"}
      </button>
    </form>
  );
}
