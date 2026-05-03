"use client";

import { motion } from "framer-motion";
import { CheckCircle, Crown, LockKey } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Free",
    price: "$0",
    features: [
      "Weekly Chaos Score",
      "Score delta tracking",
      "Clean Week Mode",
      "1 roast voice (The Therapist)",
      "Streak tracking",
      "Image export (with footer)"
    ],
    cta: "Get Free",
    popular: false,
    delay: 0
  },
  {
    name: "Pro",
    price: "$12",
    features: [
      "Everything in Free",
      "All 5 roast voices",
      "Roast Remix Mode",
      "Chaos Certificate (red)",
      "Export without footer"
    ],
    cta: "Get Pro",
    popular: true,
    delay: 0.1
  },
  {
    name: "Chaos Pass",
    price: "$4.99",
    features: [
      "Everything in Pro",
      "OS-Level Harassment",
      "Tab Title Hijacking",
      "Forced 'Touch Grass' Breaks",
      "All future unhinged updates"
    ],
    cta: "Get Chaos Pass",
    popular: false,
    delay: 0.2
  }
];

export function PricingCards() {
  return (
    <section id="pricing" className="py-32 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col items-center gap-16">
      <div className="flex flex-col items-center text-center gap-6 max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-white/10 text-xs font-medium text-zinc-400">
          <LockKey size={14} /> One-time purchase
        </div>
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">
          Pick your level of <br />
          <span className="text-zinc-500">masochism.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.5, delay: plan.delay }}
            className={cn(
              "relative flex flex-col p-8 rounded-[2rem] border transition-all duration-300",
              plan.popular 
                ? "bg-zinc-900 border-rose-500/30 shadow-[0_0_40px_-15px_rgba(244,63,94,0.15)] md:-translate-y-4" 
                : "bg-zinc-900/40 border-white/5 hover:bg-zinc-900/60"
            )}
          >
            {plan.popular && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                <Crown weight="fill" size={14} /> Most Popular
              </div>
            )}
            
            <div className="flex flex-col gap-2 mb-8 border-b border-white/5 pb-8">
              <h3 className="text-xl font-bold text-zinc-100">{plan.name}</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tighter text-zinc-100">{plan.price}</span>
                {plan.price === "$12" && <span className="text-sm text-zinc-500 font-medium">/ once</span>}
                {plan.price === "$4.99" && <span className="text-sm text-zinc-500 font-medium">/ mo</span>}
              </div>
            </div>

            <ul className="flex flex-col gap-4 mb-8 flex-1">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm text-zinc-300">
                  <CheckCircle size={18} weight="fill" className={plan.popular ? "text-rose-500 shrink-0" : "text-zinc-600 shrink-0"} />
                  <span className="leading-snug">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "w-full py-4 rounded-xl font-bold tracking-tight transition-colors cursor-pointer",
                plan.popular 
                  ? "bg-rose-500 text-white hover:bg-rose-600" 
                  : "bg-zinc-100 text-zinc-900 hover:bg-zinc-200"
              )}
            >
              {plan.cta}
            </motion.button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
