const testimonials = [
  {
    quote:
      "Market Villa helped us present our products properly and gave customers a cleaner way to order through WhatsApp.",
    name: "Amara N.",
    business: "Bakery owner",
  },
  {
    quote:
      "Our store now looks more professional. It is easier to share one link instead of sending product pictures one by one.",
    name: "Tunde A.",
    business: "Fashion seller",
  },
  {
    quote:
      "I like that I can update products, manage orders, and keep the business page looking polished without calling a developer.",
    name: "Sarah K.",
    business: "Beauty brand owner",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 pb-14 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-white/60 bg-white/65 p-5 shadow-[0_24px_80px_rgba(77,38,120,0.10)] backdrop-blur-xl md:p-7">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#7c3aed]">
            Testimonials
          </p>

          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.05em] text-[#231136] md:text-3xl">
            Built for businesses that want to look more trusted online.
          </h2>

          <p className="mt-3 text-sm leading-6 text-[#6f6380]">
            Real businesses need simple tools, polished pages, and a better way
            to turn interest into orders.
          </p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-[1.5rem] border border-[#eadffd] bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_50px_rgba(124,58,237,0.12)]"
            >
              <div className="flex gap-1 text-xs text-[#f59e0b]">
                ★★★★★
              </div>

              <p className="mt-4 text-sm leading-7 text-[#3f3154]">
                “{item.quote}”
              </p>

              <div className="mt-5 flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#7c3aed] to-[#c084fc] text-sm font-bold text-white">
                  {item.name.charAt(0)}
                </div>

                <div>
                  <p className="text-sm font-semibold text-[#231136]">
                    {item.name}
                  </p>
                  <p className="text-xs text-[#7b6f8d]">{item.business}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}


