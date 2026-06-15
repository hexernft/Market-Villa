import {
  CheckCircle2,
  MessageCircle,
  PackageCheck,
  ShoppingBag,
  Store,
} from "lucide-react";

const VIOLET = "#7c3aed";
const NAVY = "#241d4f";
const CREAM = "#fff7ed";

export function HeroStore3D() {
  return (
    <div className="pointer-events-none absolute right-8 top-1/2 z-10 hidden w-[22rem] -translate-y-1/2 lg:block xl:right-14 xl:w-[24rem]">
      <div className="relative">
        <div className="absolute -bottom-8 left-10 right-10 h-8 bg-[#241436]/30 blur-2xl" />

        <div className="relative rotate-[-1.5deg] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-sm">
          <div className="bg-white p-4 text-slate-950 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 place-items-center text-white"
                  style={{ backgroundColor: NAVY }}
                >
                  <Store size={20} />
                </span>

                <div>
                  <p className="text-sm font-semibold" style={{ color: NAVY }}>
                    ZCAS TastyBites
                  </p>
                  <p className="text-xs text-slate-500">Market Villa store</p>
                </div>
              </div>

              <span className="bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Live
              </span>
            </div>

            <div className="overflow-hidden border border-slate-200">
              <div className="grid grid-cols-5">
                <div className="h-9" style={{ backgroundColor: VIOLET }} />
                <div className="h-9" style={{ backgroundColor: CREAM }} />
                <div className="h-9" style={{ backgroundColor: VIOLET }} />
                <div className="h-9" style={{ backgroundColor: CREAM }} />
                <div className="h-9" style={{ backgroundColor: VIOLET }} />
              </div>

              <div className="grid gap-3 bg-[#fffaf4] p-4">
                <div className="grid grid-cols-[0.95fr_1.05fr] gap-3">
                  <div
                    className="min-h-32 p-4 text-white"
                    style={{ backgroundColor: NAVY }}
                  >
                    <p
                      className="text-[11px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: "#ffb067" }}
                    >
                      Business page
                    </p>

                    <p className="mt-3 text-2xl font-semibold leading-tight tracking-[-0.04em]">
                      Ready to sell
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs text-white/70">
                      <CheckCircle2 size={14} style={{ color: "#ffb067" }} />
                      WhatsApp orders
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="border border-slate-200 bg-white p-3">
                      <div className="mb-4 grid h-9 w-9 place-items-center bg-[rgba(124,58,237,0.08)]">
                        <ShoppingBag size={16} style={{ color: VIOLET }} />
                      </div>

                      <p className="text-sm font-semibold text-slate-950">
                        Meat Pie
                      </p>
                      <p className="mt-1 text-xs text-slate-500">â‚¦1,500</p>
                    </div>

                    <div className="border border-slate-200 bg-white p-3">
                      <div className="mb-4 grid h-9 w-9 place-items-center bg-[rgba(124,58,237,0.08)]">
                        <PackageCheck size={16} style={{ color: VIOLET }} />
                      </div>

                      <p className="text-sm font-semibold text-slate-950">
                        Cake Box
                      </p>
                      <p className="mt-1 text-xs text-slate-500">Order ready</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3 border border-slate-200 bg-white p-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      Order summary
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Customer sends details through WhatsApp.
                    </p>
                  </div>

                  <span
                    className="grid h-10 w-10 place-items-center text-white"
                    style={{ backgroundColor: VIOLET }}
                  >
                    <MessageCircle size={17} />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div
            className="absolute -right-4 top-7 px-4 py-2.5 text-xs font-semibold text-white shadow-xl"
            style={{ backgroundColor: VIOLET }}
          >
            New order
          </div>

          <div
            className="absolute -bottom-4 left-6 bg-white px-4 py-2.5 text-xs font-semibold shadow-xl"
            style={{ color: NAVY }}
          >
            Smart storefront
          </div>
        </div>
      </div>
    </div>
  );
}


