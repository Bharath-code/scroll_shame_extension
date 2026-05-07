"use client";

import { motion } from "framer-motion";
import { CheckCircle, ChartLineUp, Users, DownloadSimple, Fire } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const VOICES = [
  { name: "The Therapist", desc: "Concerned. Supportive. Increasingly less supportive." },
  { name: "Drill Sergeant", desc: "Accountability at volume. No euphemisms." },
  { name: "Your Mum", desc: "She's not angry. She's just disappointed." },
  { name: "Tech Bro", desc: "Reframing your chaos as a productivity problem." },
  { name: "The Accountant", desc: "Has calculated the cost of your decisions. In hours." },
];

export function FeatureBreakdown() {
  return (
    <section className="py-32 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-32">
      {/* 5 Voices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-rose-500 font-mono text-sm tracking-tight">
            <Users size={16} /> 01 / The Committee
          </div>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">
            Five Narrators. <span className="text-zinc-500">One Week.</span> All Opinions.
          </h3>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-[45ch]">
            Your report gets read by whoever you chose. They all have something to say. Unlock all 5 voices, Roast Remix Mode, and the Gold Chaos Certificate with the $24 Chaos Pass.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {VOICES.map((voice, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 p-4 rounded-2xl bg-zinc-900/20 border border-white/5 hover:bg-zinc-900/50 transition-colors group"
            >
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-rose-500/50 transition-colors">
                <span className="text-xs font-mono text-zinc-400 group-hover:text-rose-400">{i + 1}</span>
              </div>
              <div className="flex flex-col gap-1">
                <h4 className="font-bold text-zinc-200 tracking-tight">{voice.name}</h4>
                <p className="text-sm text-zinc-500 leading-relaxed">{voice.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* The Score Delta & Streak */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="order-2 md:order-1 relative aspect-[4/3] rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 flex flex-col justify-center gap-6 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(244,63,94,0.1)_0%,transparent_50%)] pointer-events-none" />
          
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <span className="text-zinc-400 font-medium">Chaos Trend</span>
            <span className="text-rose-500 font-bold flex items-center gap-1">+14% <ChartLineUp weight="bold" /></span>
          </div>
          
          <div className="flex items-end gap-2 h-32">
            {[40, 55, 62, 45, 78, 91].map((val, i) => (
              <div key={i} className="flex-1 bg-zinc-800/50 rounded-t-sm relative group-hover:bg-zinc-800 transition-colors" style={{ height: `${val}%` }}>
                {i === 5 && (
                  <motion.div 
                    initial={{ height: 0 }}
                    whileInView={{ height: '100%' }}
                    className="absolute bottom-0 left-0 right-0 bg-rose-500 rounded-t-sm"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs font-mono text-zinc-600 mt-2">
            <span>W1</span>
            <span>W2</span>
            <span>W3</span>
            <span>W4</span>
            <span>W5</span>
            <span className="text-rose-400">W6</span>
          </div>
        </motion.div>

        <div className="order-1 md:order-2 flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-rose-500 font-mono text-sm tracking-tight">
            <ChartLineUp size={16} /> 02 / The Trend
          </div>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">
            The Score <span className="text-zinc-500">Delta.</span>
          </h3>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-[45ch]">
            Was this week worse? Suspiciously better? Your report tells you whether you're trending toward chaos or pulling yourself together. This is a new shareable moment every Monday.
          </p>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Aggressive Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div className="flex flex-col gap-6">
          <div className="inline-flex items-center gap-2 text-rose-500 font-mono text-sm tracking-tight">
            <Fire size={16} /> 03 / Grand Chaos Tier
          </div>
          <h3 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">
            Grand <span className="text-zinc-500">Chaos.</span>
          </h3>
          <p className="text-lg text-zinc-400 leading-relaxed max-w-[45ch]">
            For $49, we take the kid gloves off. **Tab Title Hijacking** guilt-trips you when you abandon tabs. **OS-Level Harassment** blows up your notifications when you spiral. And if you doomscroll for 5 minutes straight? We literally hijack your screen and force you to **Touch Grass**.
          </p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative aspect-square md:aspect-video rounded-[2.5rem] bg-zinc-900/40 border border-white/5 p-8 flex flex-col gap-4 overflow-hidden group"
        >
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1533460004989-cef01064af7e?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center opacity-40 group-hover:opacity-80 transition-opacity duration-700" />
          <div className="absolute inset-0 bg-black/60" />
          
          <div className="relative z-10 flex flex-col h-full items-center justify-center gap-4">
            <motion.div 
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="bg-black/80 backdrop-blur-md border border-rose-500/50 p-6 rounded-2xl flex flex-col items-center gap-2 max-w-sm text-center shadow-2xl"
            >
              <Fire size={32} className="text-rose-500 mb-2" weight="duotone" />
              <h4 className="text-xl font-bold text-white tracking-tight">TOUCH GRASS.</h4>
              <p className="text-sm text-zinc-300">
                You have been scrolling for 5 minutes. You have 10 seconds to contemplate your life choices before your browser unlocks.
              </p>
            </motion.div>
          </div>
          
          <div className="absolute bottom-6 right-8 z-10 bg-rose-500/10 border border-rose-500/20 px-3 py-1 rounded-full text-[10px] font-mono text-rose-400 animate-pulse">
            System Override Active
          </div>
        </motion.div>
      </div>
    </section>
  );
}
