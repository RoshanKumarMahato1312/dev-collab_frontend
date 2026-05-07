import Link from "next/link";
import AuthForm from "@/components/AuthForm";

export default function SignupPage() {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1fr_1fr]">
      <section className="order-2 flex items-center justify-center bg-transparent p-6 lg:order-1 lg:p-10">
        <div className="w-full max-w-md space-y-4">
          <AuthForm mode="signup" />
          <p className="text-center text-sm text-slate-500">
            Already have an account? <Link href="/login" className="font-medium text-sky-600 transition hover:text-sky-700">Login</Link>
          </p>
        </div>
      </section>

      <section className="order-1 relative overflow-hidden border-b border-slate-200 bg-white p-8 lg:order-2 lg:border-b-0 lg:border-l lg:p-12">
        <div className="absolute inset-0 industrial-grid opacity-30" />
        <div className="relative flex h-full flex-col justify-between gap-10">
          <div className="max-w-xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-600">Get Started</p>
            <h1 className="heading-font text-4xl font-semibold tracking-tight text-slate-900 md:text-6xl">
              Create your workspace in minutes.
            </h1>
            <p className="max-w-lg text-sm leading-6 text-slate-500 md:text-base">
              Invite teammates, organize projects, and keep conversations and tasks visible in one place.
            </p>
          </div>

          <div className="surface-panel max-w-lg rounded-2xl p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Setup Flow</p>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              <p>Create your profile</p>
              <p>Spin up your first project</p>
              <p>Invite the team</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
