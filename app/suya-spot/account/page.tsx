export default function SuyaSpotAccountPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#fff7ed,#ede9fe)] px-4 text-[#17120a]">
      <section className="w-full max-w-xl rounded-[2rem] border border-[#e7dcc8] bg-white/90 p-6 shadow-xl backdrop-blur md:p-8">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#b45309]">
          S I S Suya Spot
        </p>

        <h1 className="mt-4 text-3xl font-black tracking-[-0.05em]">
          Customer Account
        </h1>

        <p className="mt-3 text-sm font-semibold leading-6 text-[#6f6252]">
          Access your customer account, return to the store, or continue browsing as a guest.
        </p>

        <div className="mt-6 rounded-[1.5rem] border border-dashed border-[#e7dcc8] bg-[#fffaf0] p-4">
          <p className="text-sm font-black text-[#17120a]">
            Order history
          </p>
          <p className="mt-2 text-sm font-semibold leading-6 text-[#6f6252]">
            Your order history will appear here after customer orders are connected to your account.
          </p>
        </div>

        <div className="mt-7 grid gap-3">
          <a
            href="/suya-spot/login"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#facc15] px-5 text-sm font-black text-black"
          >
            Customer Login
          </a>

          <a
            href="/suya-spot/grill"
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#17120a] px-5 text-sm font-black text-white"
          >
            The Grill
          </a>

          <a
            href="/suya-spot"
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#e7dcc8] px-5 text-sm font-black text-[#17120a]"
          >
            Back to Store
          </a>
        </div>
      </section>
    </main>
  );
}
