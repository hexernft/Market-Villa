import Link from "next/link";
import { CheckCircle2, Mail, ArrowRight } from "lucide-react";
import { BRAND } from "@/lib/brand";

export default function SignupSuccessPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.16),transparent_34%),linear-gradient(135deg,#f8f4ff,#ffffff_45%,#f3edf8)] px-4 py-24">
      <section className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center">
        <div className="w-full rounded-[2rem] border border-[#7c3aed]/12 bg-white/86 p-6 text-center shadow-[0_28px_90px_rgba(36,20,54,0.14)] backdrop-blur-2xl md:p-10">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-[1.4rem] bg-[#f0e7ff] text-[#7c3aed] ring-1 ring-[#7c3aed]/14">
            <CheckCircle2 size={30} />
          </div>

          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.24em] text-[#7c3aed]">
            Signup successful
          </p>

          <h1 className="mx-auto mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-[-0.055em] text-[#241436] md:text-5xl">
            Check your email to confirm your account.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#241436]/68">
            Your {BRAND.name} account has been created. We sent a confirmation link to your email address. Open your mailbox and confirm your account before logging in.
          </p>

          <div className="mx-auto mt-7 flex max-w-xl items-start gap-3 rounded-[1.35rem] border border-[#7c3aed]/12 bg-[#f8f4ff] p-4 text-left">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-[#7c3aed]">
              <Mail size={18} />
            </div>

            <div>
              <p className="text-sm font-bold text-[#241436]">
                Didn&apos;t see the email?
              </p>
              <p className="mt-1 text-sm leading-6 text-[#241436]/64">
                Check your spam, promotions, or updates folder. The email may take a few minutes to arrive.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-[#241436] px-5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#160d22]"
            >
              Go to Login
              <ArrowRight size={16} />
            </Link>

            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-[#7c3aed]/14 bg-white px-5 text-sm font-bold text-[#241436] transition hover:-translate-y-0.5 hover:bg-[#f8f4ff]"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
