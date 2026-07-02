export default function SuyaSpotLoginPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#fff7ed,#ede9fe)] px-4 text-[#17120a]">
      <section className="w-full max-w-md rounded-[2rem] border border-[#3b2415]/15 bg-[#21140c] p-6 text-[#fff8e1] shadow-2xl md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#facc15]">
          S I S Suya Spot
        </p>

        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">
          Customer Login
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-white/70">
          Sign in to continue with your S I S Suya Spot customer account.
        </p>

        <form className="mt-7 grid gap-3">
          <input
            type="email"
            placeholder="Email address"
            className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-sm font-bold text-[#17120a] outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            className="h-12 rounded-2xl border border-white/10 bg-white px-4 text-sm font-bold text-[#17120a] outline-none"
          />

          <button
            type="button"
            className="mt-2 inline-flex h-12 items-center justify-center rounded-full bg-[#facc15] px-5 text-sm font-black text-black"
          >
            Login
          </button>

          <button
            type="button"
            className="inline-flex h-12 items-center justify-center rounded-full border border-[#facc15]/35 px-5 text-sm font-black text-[#fff8e1]"
          >
            Create Account
          </button>

          <a
            href="/suya-spot"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/10 px-5 text-sm font-black text-white/80"
          >
            Continue as Guest
          </a>
        </form>

        <div className="mt-6 flex items-center justify-between gap-3 text-xs font-bold text-white/55">
          <a href="/suya-spot">Back to store</a>
          <a href="/suya-spot/grill">The Grill</a>
        </div>
      </section>
    </main>
  );
}
