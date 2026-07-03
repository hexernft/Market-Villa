"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Store } from "lucide-react";
import { supabase } from "@/lib/supabase";

function getSafeNext(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

function StoreCustomerLoginContent() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const slug = params.slug;
  const storeHome = `/store/${slug}`;
  const accountPath = `/store/${slug}/account`;
  const next = getSafeNext(searchParams.get("next"), accountPath);

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
                ? `${window.location.origin}${accountPath}`
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

  const isSignup = mode === "signup";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.16),transparent_34%),linear-gradient(135deg,#faf5ff,#fff7ed)] px-4 py-8 text-[#241436]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center">
        <section className="w-full rounded-[1.75rem] border border-[#eadfff] bg-white p-5 md:p-6">
          <Link
            href={storeHome}
            className="inline-flex items-center gap-2 text-sm font-black text-[#7c3aed]"
          >
            <ArrowLeft size={16} />
            Back to store
          </Link>

          <div className="mt-6">
            <p className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.22em] text-[#7c3aed]">
              <Store size={14} />
              Market Villa Store
            </p>

            <h1 className="mt-4 text-2xl font-black tracking-[-0.04em]">
              {isSignup ? "Create Account" : "Customer Login"}
            </h1>

            <p className="mt-2 text-sm font-semibold leading-6 text-[#cdbfdc]">
              {isSignup
                ? "Create a customer account for faster orders next time."
                : "Sign in to continue with this store."}
            </p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-full border border-[#eadfff] bg-[#faf8ff] p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setMessage("");
              }}
              className={`h-10 rounded-full text-sm font-black transition ${
                mode === "login"
                  ? "bg-[#f59e0b] text-white"
                  : "text-[#cdbfdc] hover:text-[#241436]"
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
              className={`h-10 rounded-full text-sm font-black transition ${
                mode === "signup"
                  ? "bg-[#f59e0b] text-white"
                  : "text-[#cdbfdc] hover:text-[#241436]"
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-5 grid gap-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              placeholder="Email address"
              className="h-12 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              type="password"
              placeholder="Password"
              className="h-12 rounded-2xl border border-[#eadfff] bg-white px-4 text-sm font-bold text-[#241436] outline-none focus:border-[#7c3aed] focus:ring-4 focus:ring-[#7c3aed]/10"
            />

            {message ? (
              <p className="rounded-2xl border border-[#eadfff] bg-[#faf8ff] p-3 text-xs font-bold leading-5 text-[#4c1d95]">
                {message}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="mt-1 inline-flex h-11 items-center justify-center rounded-full bg-[#f59e0b] px-5 text-sm font-black text-white transition hover:bg-[#6d28d9] disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="mr-2 animate-spin" size={17} /> : null}
              {isSignup ? "Create Account" : "Login"}
            </button>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfff] bg-white px-5 text-sm font-black text-[#241436] transition hover:bg-[#faf8ff] disabled:opacity-60"
            >
              Continue with Google
            </button>

            <Link
              href={storeHome}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#eadfff] px-5 text-sm font-black text-[#e9ddff] transition hover:bg-[#faf8ff]"
            >
              Continue as Guest
            </Link>
          </form>
        </section>
      </div>
    </main>
  );
}

function LoginFallback() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#241436] px-4 text-white">
      <div className="inline-flex items-center gap-3 text-sm font-black">
        <Loader2 className="animate-spin text-purple-200" size={18} />
        Loading customer login...
      </div>
    </main>
  );
}

export default function StoreCustomerLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <StoreCustomerLoginContent />
    </Suspense>
  );
}


