"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { signUpWithEmail } from "@/lib/auth";

export default function SignupPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSignup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);

    const ownerName = `${firstName} ${lastName}`.trim();
    const generatedSlug = businessName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    try {
      await signUpWithEmail({
        email,
        password,
        fullName: ownerName,
      });

      localStorage.setItem(
        "marketVillaPendingBusiness",
        JSON.stringify({
          ownerName,
          firstName,
          lastName,
          businessName,
          email,
          whatsapp,
          slug: generatedSlug,
        })
      );

      router.push("/signup-success");
    } catch (error) {
      const rawErrorMessage =
        error instanceof Error ? error.message : "Unable to create account.";

      const errorMessage = rawErrorMessage.toLowerCase().includes("rate limit")
        ? "Too many confirmation emails were requested recently. Please wait a few minutes, then try again."
        : rawErrorMessage;

      setMessage(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf2f4] px-4 py-6 text-slate-950">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="orb orb-one" />
        <div className="orb orb-two" />
        <div className="orb orb-three" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-6xl items-center justify-center">
        <div className="auth-card w-full max-w-md rounded-[26px] bg-white px-5 py-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] sm:px-4 sm:py-7">
          <div className="mb-3 flex flex-col items-center text-center">
            <div className=" mb-2">
              <Image
                src="/market-villa-logo.png"
                alt="Market Villa"
                width={58}
                height={58}
                className="h-[58px] w-[58px] object-contain"
                priority
              />
            </div>

            <p className="-mt-2 text-[17px] font-semibold tracking-[-0.04em] text-slate-950">
              Market Villa
            </p>
          </div>

          <div className="mb-5 text-center">
            <h1 className="text-[25px] font-semibold leading-tight tracking-[-0.04em] text-slate-950 sm:text-[29px]">
              Start your business page
            </h1>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Create your account now and complete your setup inside the dashboard.
            </p>
          </div>

          <form onSubmit={handleSignup} className="grid gap-3">
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
              placeholder="Email address"
              type="email"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={firstName}
                onChange={(event) => setFirstName(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="First name"
                required
              />

              <input
                value={lastName}
                onChange={(event) => setLastName(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="Last name"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={businessName}
                onChange={(event) => setBusinessName(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="Business"
                required
              />

              <input
                value={whatsapp}
                onChange={(event) => setWhatsapp(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="WhatsApp"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="Password"
                type="password"
                minLength={6}
                required
              />

              <input
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="h-11 rounded-[14px] border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-[var(--mv-violet)] focus:shadow-[0_0_0_4px_rgba(124,58,237,0.12)]"
                placeholder="Confirm password"
                type="password"
                minLength={6}
                required
              />
            </div>

            {message ? (
              <div className="rounded-[20px] border border-red-200 bg-red-50 px-4 py-2.5 text-sm leading-6 text-red-700">
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-1 inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#7c3aed] px-5 text-sm font-semibold text-white transition duration-300 hover:-translate-y-0.5 hover:bg-[#8b5cf6] hover:shadow-[0_16px_40px_rgba(2,8,31,0.22)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : null}
              {isSubmitting ? "Creating account..." : "Continue with email"}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <span className="text-sm text-slate-400">or</span>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <Link
            href="/login"
            className="inline-flex h-11 w-full items-center justify-center rounded-full border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-800 transition duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
          >
            Already have an account? Login
          </Link>

          <div className="mt-3 text-center">
            <Link
              href="/"
              className="text-sm text-slate-500 transition hover:text-slate-900"
            >
              Back to website
            </Link>
          </div>
        </div>
      </div>

      <style jsx>{`
        .auth-card {
          animation: cardIn 0.55s ease-out;
        }

        . {
          animation: floatLogo 4s ease-in-out infinite;
        }

        .orb {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          opacity: 0.35;
          animation: drift 14s ease-in-out infinite;
        }

        .orb-one {
          width: 220px;
          height: 220px;
          background: rgba(148, 163, 184, 0.18);
          top: 8%;
          left: 10%;
        }

        .orb-two {
          width: 280px;
          height: 280px;
          background: rgba(15, 23, 42, 0.08);
          right: 10%;
          top: 18%;
          animation-delay: 1.5s;
        }

        .orb-three {
          width: 240px;
          height: 240px;
          background: rgba(59, 130, 246, 0.07);
          left: 20%;
          bottom: 8%;
          animation-delay: 3s;
        }

        @keyframes cardIn {
          from {
            opacity: 0;
            transform: translateY(18px) scale(0.985);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes floatLogo {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes drift {
          0%,
          100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(14px, -18px, 0);
          }
        }
      `}</style>
    </main>
  );
}



