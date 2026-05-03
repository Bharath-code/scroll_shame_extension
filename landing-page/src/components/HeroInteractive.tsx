"use client";

import { motion } from "framer-motion";
import { ArrowRight, Browser } from "@phosphor-icons/react";

export function HeroInteractive() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center px-4 md:px-8 py-24 overflow-hidden max-w-7xl mx-auto w-full">
      <div className="absolute inset-0 pointer-events-none grid grid-cols-1 md:grid-cols-2">
        <div className="hidden md:block border-r border-white/5" />
      </div>

      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        {/* Left Side: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            V1.0 is live
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-zinc-100">
            Your browser has been keeping a <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">file on you.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[45ch]">
            Every tab, every 2am session, every tab you opened and closed in thirty seconds hoping nobody noticed. ScrollShame turns your browser history into a weekly Chaos Report — narrated by someone who has opinions about it.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative w-full sm:w-auto px-8 py-4 bg-zinc-100 text-zinc-900 rounded-2xl font-bold tracking-tight overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-rose-500/0 via-rose-500/10 to-rose-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              <span className="relative flex items-center justify-center gap-2">
                Get ScrollShame — Free
                <ArrowRight weight="bold" className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>
            <p className="text-sm text-zinc-500 text-center sm:text-left">
              Chrome extension · No account<br />Your browser keeps the receipts
            </p>
          </div>
        </motion.div>

        {/* Right Side: Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full aspect-square md:aspect-[4/5] rounded-[2.5rem] bg-zinc-900/50 border border-white/10 overflow-hidden flex items-center justify-center group"
        >
          {/* Inner Refraction */}
          <div className="absolute inset-0 border border-white/5 rounded-[2.5rem] pointer-events-none" />
          <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)] rounded-[2.5rem] pointer-events-none" />
          
          <div className="relative z-10 p-8 w-full max-w-sm flex flex-col gap-6">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="bg-zinc-950 border border-white/10 rounded-2xl p-6 shadow-2xl relative"
            >
              <div className="absolute top-0 right-8 -translate-y-1/2 bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                Score: 91
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                  <Browser size={24} weight="duotone" className="text-zinc-400" />
                </div>
                <div>
                  <h3 className="font-bold text-zinc-200 tracking-tight">Week 8 of Chaos</h3>
                  <p className="text-sm text-zinc-500">The Therapist</p>
                </div>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                "I see you opened 47 tabs about mechanical keyboards between 1:00 AM and 3:30 AM. Are we trying to fill a void, or just our desk space?"
              </p>
              <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-rose-500 w-[91%]" />
              </div>
            </motion.div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.15)_0%,transparent_50%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
