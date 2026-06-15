"use client";

import Image from "next/image";
import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { signInWithEmail } from "@/lib/auth";
import { requireSuperAdmin } from "@/lib/business-actions";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleAdminLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsSubmitting(true);

    try {
      await signInWithEmail({
        email,
        password,
      });

      await requireSuperAdmin();

      router.push("/admin");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to login as admin.";

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-5 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-7 shadow-soft">
        <Link href="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#26143d] text-white">
            <ShieldCheck size={20} />
          </span>

          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Market Villa
            </span>
            <span className="text-sm font-semibold text-slate-950">
              Admin Login
            </span>
          </span>
        </Link>

        <h1 className="text-2xl font-semibold tracking-[-0.05em] text-slate-950">
          Platform admin access
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Login with a Market Villa account that has the super_admin role.
        </p>

        <form onSubmit={handleAdminLogin} className="mt-8 grid gap-4">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[var(--mv-violet)]"
            placeholder="Admin email address"
            type="email"
            required
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 outline-none focus:border-[var(--mv-violet)]"
            placeholder="Admin password"
            type="password"
            required
          />

          {message ? (
            <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#26143d] px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : null}
            {isSubmitting ? "Checking access..." : "Login to Admin Center"}
          </button>
        </form>

        <div className="mt-6 grid gap-3 text-center text-sm">
          <Link href="/login" className="font-semibold text-slate-950">
            Business owner login
          </Link>

          <Link href="/" className="text-slate-500 hover:text-slate-950">
            Back to website
          </Link>
        </div>
      </div>
    </main>
  );
}
