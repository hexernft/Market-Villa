"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function getSafeNext(value: string | null) {
  if (!value) return "/suya-spot/account";
  if (!value.startsWith("/")) return "/suya-spot/account";
  if (value.startsWith("//")) return "/suya-spot/account";
  return value;
}

function SuyaSpotLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = getSafeNext(searchParams.get("next"));

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isSignup = mode === "signup";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo:
              typeof window !== "undefined"
                ? `${window.location.origin}/suya-spot/account`
                : undefined,
          },
        });

        if (error) throw error;

        setMessage("Account created. Please check your email to confirm your account.");
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace(next);
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to continue.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    setIsLoading(true);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}${next}`
        : undefined;

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#120b07] px-4 py-8 text-[#fff8e1]">
      <section className="w-full max-w-[350px] rounded-[1.3rem] border border-[#f59e0b]/30 bg-[#130b07] p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.35)] md:p-4">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Link
            href="/suya-spot"
            className="inline-flex items-center gap-2 text-[11px] font-black text-[#f59e0b]"
          >
            <ArrowLeft size={14} />
            Back to store
          </Link>

          <Link
            href="/suya-spot/grill"
            className="rounded-full border border-[#f59e0b]/35 px-3 py-1.5 text-[11px] font-black text-[#ffe8b5]"
          >
            The Grill
          </Link>
        </div>

        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#f59e0b]">
          <Flame size={13} />
          S I S Suya Spot
        </p>

        <h1 className="mt-2 text-xl font-black tracking-[-0.04em] text-[#fff8e1]">
          {isSignup ? "Create Account" : "Customer Login"}
        </h1>

        <div className="mt-3 grid grid-cols-2 gap-1.5 rounded-[0.95rem] border border-[#f59e0b]/30 bg-[#0b0604] p-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMessage("");
            }}
            className={`h-8 rounded-[0.75rem] text-xs font-black transition ${
              mode === "login"
                ? "bg-[#f59e0b] text-black"
                : "text-[#fff8e1] hover:text-[#facc15]"
            }`}
          >
            Login
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("signup");
              setMessage("");
            }}
            className={`h-8 rounded-[0.75rem] text-xs font-black transition ${
              mode === "signup"
                ? "bg-[#f59e0b] text-black"
                : "text-[#fff8e1] hover:text-[#facc15]"
            }`}
          >
            Create Account
          </button>
        </div>

        <p className="mt-3 text-xs font-semibold leading-5 text-[#d8c6ad]">
          {isSignup
            ? "Create a customer account for faster orders next time."
            : "Sign in to continue with your S I S Suya Spot customer account."}
        </p>

        <form onSubmit={handleSubmit} className="mt-4 grid gap-2.5 rounded-[1.1rem] border border-[#f59e0b]/25 bg-[#2a170c] p-2.5">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            placeholder="Email address"
            className="h-9 rounded-[0.85rem] border border-[#f59e0b]/25 bg-[#3b2415] px-3 text-xs font-bold text-[#fff8e1] outline-none placeholder:text-[#d8c6ad] focus:border-[#f59e0b]"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            type="password"
            placeholder="Password"
            className="h-9 rounded-[0.85rem] border border-[#f59e0b]/25 bg-[#3b2415] px-3 text-xs font-bold text-[#fff8e1] outline-none placeholder:text-[#d8c6ad] focus:border-[#f59e0b]"
          />

          {message ? (
            <p className="rounded-[0.9rem] border border-[#f59e0b]/25 bg-[#3b2415] p-2.5 text-[11px] font-bold leading-5 text-[#ffe8b5]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-1 inline-flex h-9 items-center justify-center rounded-[0.85rem] bg-[#f59e0b] px-4 text-xs font-black text-black transition hover:bg-[#facc15] disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="mr-2 animate-spin" size={15} /> : null}
            {isSignup ? "Create Account" : "Login"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="inline-flex h-9 items-center justify-center rounded-[0.85rem] border border-[#facc15]/35 bg-[#1b0e07] px-4 text-xs font-black text-[#facc15] transition hover:bg-[#3b2415] disabled:opacity-60"
          >
            Continue with Google
          </button>

          <Link
            href="/suya-spot"
            className="inline-flex h-9 items-center justify-center rounded-[0.85rem] border border-[#facc15]/20 bg-[#3b2415] px-4 text-xs font-black text-[#fff8e1] transition hover:border-[#facc15] hover:text-[#facc15]"
          >
            Continue as Guest
          </Link>
        </form>
      </section>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#17100b] px-4 text-[#fff8e1]">
      <div className="inline-flex items-center gap-3 text-sm font-black">
        <Loader2 className="animate-spin text-[#f59e0b]" size={18} />
        Loading customer login...
      </div>
    </main>
  );
}

export default function SuyaSpotLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <SuyaSpotLoginContent />
    </Suspense>
  );
}

