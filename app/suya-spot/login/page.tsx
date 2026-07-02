"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Flame, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

function SuyaSpotLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/suya-spot/account";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setIsLoading(true);

    try {
      if (mode === "signup") {
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
      options: {
        redirectTo,
      },
    });

    if (error) {
      setMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#fff7ed,#ede9fe)] px-4 text-[#17120a]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#3b2415]/15 bg-[#21140c] p-6 text-[#fff8e1] shadow-2xl md:p-8">
        <Link
          href="/suya-spot"
          className="inline-flex items-center gap-2 text-sm font-black text-[#facc15]"
        >
          <ArrowLeft size={16} />
          Back to store
        </Link>

        <div className="mt-7">
          <p className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#facc15]">
            <Flame size={14} />
            S I S Suya Spot
          </p>

          <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">
            {mode === "login" ? "Customer Login" : "Create Account"}
          </h1>

          <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
            {mode === "login"
              ? "Sign in to continue with your S I S Suya Spot customer account."
              : "Create a customer account for faster orders next time."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-7 grid gap-3">
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            placeholder="Email address"
            className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-sm font-bold text-[#17120a] outline-none"
          />

          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            minLength={6}
            type="password"
            placeholder="Password"
            className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-sm font-bold text-[#17120a] outline-none"
          />

          {message ? (
            <p className="rounded-2xl border border-[#facc15]/35 bg-[#fff4c2] p-3 text-xs font-bold text-[#7c2d12]">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[#facc15] px-5 text-sm font-black text-black disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="mr-2 animate-spin" size={17} /> : null}
            {mode === "login" ? "Login" : "Create Account"}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#facc15]/35 px-5 text-sm font-black text-[#fff8e1] disabled:opacity-60"
          >
            Continue with Google
          </button>

          <Link
            href="/suya-spot"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-black text-white/80"
          >
            Continue as Guest
          </Link>
        </form>

        <div className="mt-6 text-center text-sm font-bold text-white/60">
          {mode === "login" ? (
            <>
              New customer?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setMessage("");
                }}
                className="font-black text-[#facc15]"
              >
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage("");
                }}
                className="font-black text-[#facc15]"
              >
                Login
              </button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#17100b] px-4 text-[#fff8e1]">
      <div className="inline-flex items-center gap-3 text-sm font-black">
        <Loader2 className="animate-spin text-[#facc15]" size={18} />
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
