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

  return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
}
