import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-200 via-zinc-100 to-slate-200 p-6">
      <div className="w-full max-w-md space-y-3">
        <AuthForm mode="login" />
        <p className="text-center text-sm text-zinc-600">
          New here? <Link href="/signup" className="font-medium text-zinc-900">Create account</Link>
        </p>
      </div>
    </main>
  );
}
