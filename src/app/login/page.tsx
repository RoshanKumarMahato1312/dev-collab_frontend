import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function LoginPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white p-8 lg:border-b-0 lg:border-r lg:p-12">
        <div className="absolute inset-0 industrial-grid opacity-30" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-sky-600">Dev Collab</p>
            <h1 className="heading-font text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              A focused workspace that keeps teams shipping.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-500 md:text-base">
              Tasks, chat, snippets, and AI live together in one clean workspace. Fewer tabs. More progress.
            </p>
          </div>

          <div className="surface-panel max-w-lg rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Status</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Projects sync in real time</p>
              <p>Notifications stay visible</p>
              <p>Boards update instantly</p>
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-transparent p-6 lg:p-10">
        <div className="w-full max-w-md space-y-4">
          <AuthForm mode="login" />
          <p className="text-center text-sm text-slate-500">
            New here? <Link href="/signup" className="font-medium text-sky-600 transition hover:text-sky-700">Create account</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
