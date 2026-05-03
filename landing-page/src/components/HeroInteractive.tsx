"use client";

import { motion } from "framer-motion";
import { ArrowRight, Browser } from "@phosphor-icons/react";

const BACKGROUND_ELEMENTS = [
  { left: 15, top: 25, rotateInit: -10, rotateAnim: 180, duration: 6.5 },
  { left: 85, top: 40, rotateInit: 15, rotateAnim: -120, duration: 8.2 },
  { left: 35, top: 75, rotateInit: -5, rotateAnim: 240, duration: 5.8 },
  { left: 65, top: 15, rotateInit: 20, rotateAnim: -90, duration: 7.4 },
  { left: 25, top: 60, rotateInit: -15, rotateAnim: 150, duration: 9.1 },
  { left: 75, top: 85, rotateInit: 5, rotateAnim: -180, duration: 6.9 },
];

export function HeroInteractive() {
  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center px-4 md:px-8 py-24 overflow-hidden max-w-7xl mx-auto w-full">
      {/* Chaotic Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {BACKGROUND_ELEMENTS.map((el, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100, rotate: el.rotateInit }}
            animate={{ 
              opacity: [0, 0.2, 0],
              y: [-20, -120],
              x: Math.sin(i) * 50,
              rotate: el.rotateAnim 
            }}
            transition={{ 
              duration: el.duration, 
              repeat: Infinity, 
              delay: i * 1.2,
              ease: "linear"
            }}
            className="absolute rounded-lg border border-rose-500/20 bg-rose-500/5 w-24 h-16 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            style={{
              left: `${el.left}%`,
              top: `${el.top}%`,
            }}
          >
            <div className="w-full h-2 bg-rose-500/20 rounded-t-lg" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 items-center">
        {/* Left Side: Copy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-start gap-8"
        >
          <motion.div 
            whileHover={{ rotate: [-2, 2, -2], scale: 1.05 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-rose-500/30 text-sm font-medium text-rose-300 cursor-help"
          >
            <span className="text-lg">🔥</span>
            Your browser needs therapy
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-[1.1] text-zinc-100">
            Your browser is <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-red-500 to-rose-600 inline-block origin-left hover:scale-105 hover:rotate-2 transition-transform cursor-pointer">quietly judging you.</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 leading-relaxed max-w-[45ch]">
            Every unread tab. Every 3 AM doomscroll. Every time you rage-quit Twitter just to reopen it 5 seconds later. ScrollShame turns your digital dumpster fire into a weekly narrated receipt. And if you're really out of control? We will actively harass you until you stop.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mt-4">
            <motion.button
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95, rotate: 2 }}
              className="group relative w-full sm:w-auto px-8 py-4 bg-rose-500 text-white rounded-2xl font-bold tracking-tight overflow-hidden shadow-[0_0_40px_rgba(244,63,94,0.3)] hover:shadow-[0_0_60px_rgba(244,63,94,0.5)] transition-all"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500" />
              <span className="relative flex items-center justify-center gap-2">
                Get Roasted — Free
                <ArrowRight weight="bold" className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </span>
            </motion.button>
            <p className="text-sm text-zinc-500 text-center sm:text-left font-mono">
              no account required.<br/>we don't want your data.
            </p>
          </div>
        </motion.div>

        {/* Right Side: Visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring", stiffness: 100 }}
          className="relative w-full aspect-square md:aspect-[4/5] rounded-[2.5rem] bg-zinc-900/80 border-2 border-rose-500/20 overflow-hidden flex items-center justify-center group shadow-2xl"
        >
          {/* Inner Refraction */}
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay" />
          
          <div className="relative z-10 p-8 w-full max-w-sm flex flex-col gap-6">
            <motion.div 
              animate={{ 
                y: [0, -15, 0],
                rotateZ: [0, 2, -1, 0]
              }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
            >
              {/* Caution tape strip */}
              <div className="absolute top-0 left-0 w-full h-2 bg-repeating-linear-gradient(45deg,#f43f5e,#f43f5e 10px,#18181b 10px,#18181b 20px)" />

              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute top-4 right-4 bg-rose-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(244,63,94,0.8)] rotate-12"
              >
                Score: 91
              </motion.div>
              
              <div className="flex items-center gap-4 mb-6 mt-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center -rotate-6">
                  <span className="text-2xl">🧐</span>
                </div>
                <div>
                  <h3 className="font-black text-zinc-100 tracking-tighter text-lg">Week 8 of Chaos</h3>
                  <p className="text-xs text-rose-400 font-mono">The Therapist</p>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed mb-6 font-medium italic">
                "I see you opened 47 tabs about mechanical keyboards between 1:00 AM and 3:30 AM. Are we trying to fill a void, or just our desk space?"
              </p>
              
              <div className="w-full flex items-center gap-2">
                <div className="text-[10px] font-mono text-zinc-500">Sanity</div>
                <div className="flex-1 h-3 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5 relative">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "9%" }}
                    transition={{ delay: 1, duration: 1.5, type: "spring" }}
                    className="absolute top-0 left-0 h-full bg-rose-500" 
                  />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Background Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(244,63,94,0.2)_0%,transparent_60%)] animate-pulse pointer-events-none" />
        </motion.div>
      </div>
    </section>
  );
}
