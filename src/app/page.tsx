"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.replace("/dashboard");
      return;
    }
    router.replace("/login");
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-transparent text-slate-500">
      <div className="surface-panel rounded-2xl px-5 py-4 text-xs font-semibold uppercase tracking-[0.3em]">
        Booting workspace...
      </div>
    </div>
  );
}
