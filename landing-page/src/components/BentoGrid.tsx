"use client";

import { motion } from "framer-motion";
import { DownloadSimple, BellRinging, Eye, PresentationChart, ShareNetwork, Fire } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Quietly Observes",
    description: "ScrollShame watches your tabs. Quietly. Professionally. It doesn't judge. Yet.",
    icon: Eye,
    className: "col-span-1 md:col-span-2 row-span-1",
    action: "Install",
    activeVisual: <ActiveEyeVisual />
  },
  {
    title: "The Weekly Receipt",
    description: "A Wrapped-style summary notification. Your week in chaos, visualized.",
    icon: BellRinging,
    className: "col-span-1",
    action: "Monday",
    activeVisual: <PulseNotification />
  },
  {
    title: "Chaos Certificates",
    description: "Score 80+? Download an official printable diploma. Show your boss.",
    icon: DownloadSimple,
    className: "col-span-1",
    action: "Download",
    activeVisual: <CertificateVisual />
  },
  {
    title: "The Chaos Score",
    description: "A number between 0 and 100 representing your exact level of browser-based instability.",
    icon: PresentationChart,
    className: "col-span-1 md:col-span-2 row-span-1",
    action: "Read it",
    activeVisual: <ScoreDeltaVisual />
  },
  {
    title: "Dynamic X Shares",
    description: "Your report card converts into a dynamic roast tweet. A new shareable moment every week.",
    icon: ShareNetwork,
    className: "col-span-1 md:col-span-2 row-span-1",
    action: "Post",
    activeVisual: <TweetVisual />
  },
  {
    title: "Chaos Streaks",
    description: "Every consecutive week adds to your streak. Quarterly and Yearly 'Wrapped' reviews imminent.",
    icon: Fire,
    className: "col-span-1",
    action: "Keep it up",
    activeVisual: <StreakVisual />
  }
];

export function BentoGrid() {
  return (
    <section id="features" className="py-32 px-4 md:px-8 max-w-7xl mx-auto w-full flex flex-col gap-16">
      <div className="flex flex-col gap-4 max-w-2xl">
        <h2 className="text-4xl md:text-5xl font-bold tracking-tighter text-zinc-100">
          Everything your browser <br />
          <span className="text-zinc-500">knows about you.</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
        {features.map((feature, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "group relative flex flex-col justify-between overflow-hidden rounded-[2rem] bg-zinc-900/40 border border-white/5 p-8",
              feature.className
            )}
          >
            {/* Liquid Glass Refraction */}
            <div className="absolute inset-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] rounded-[2rem] pointer-events-none" />
            
            {/* Background Hover Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Active Visual Context */}
            <div className="absolute top-8 right-8 z-0">
              {feature.activeVisual}
            </div>

            <div className="relative z-10 flex flex-col justify-between h-full pointer-events-none">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/50 border border-white/5 w-max text-xs font-mono text-zinc-400">
                <span className="text-rose-500">Step 0{i + 1}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                {feature.action}
              </div>

              <div className="flex flex-col gap-2 mt-auto pt-16 pointer-events-auto">
                <div className="flex items-center gap-3 text-zinc-100">
                  <feature.icon size={24} weight="duotone" className="text-rose-400" />
                  <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed max-w-[40ch]">
                  {feature.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

// Micro-animations for the Bento cards

function ActiveEyeVisual() {
  return (
    <div className="w-32 h-32 relative opacity-20 group-hover:opacity-100 transition-opacity duration-700">
      <motion.div 
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl"
      />
      <div className="absolute inset-0 border border-dashed border-white/10 rounded-full animate-[spin_30s_linear_infinite]" />
      <div className="absolute inset-4 border border-dashed border-rose-500/30 rounded-full animate-[spin_20s_linear_infinite_reverse]" />
    </div>
  );
}

function PulseNotification() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24">
      <motion.div 
        animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute inset-4 bg-rose-500 rounded-full blur-md"
      />
      <div className="w-12 h-12 bg-zinc-800 border border-white/10 rounded-2xl flex items-center justify-center relative z-10 shadow-xl group-hover:-translate-y-2 transition-transform duration-500">
        <BellRinging size={20} className="text-zinc-300" />
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full border-2 border-zinc-800" />
      </div>
    </div>
  );
}

function CertificateVisual() {
  return (
    <div className="relative w-24 h-32 opacity-30 group-hover:opacity-100 transition-all duration-500 group-hover:-rotate-3 group-hover:-translate-y-2">
      <div className="absolute inset-0 bg-zinc-900 border border-rose-500/30 shadow-lg rounded-sm p-2 flex flex-col gap-2">
        <div className="w-full h-2 bg-rose-500/20 rounded-full" />
        <div className="w-3/4 h-2 bg-zinc-800 rounded-full mx-auto mt-2" />
        <div className="w-1/2 h-2 bg-zinc-800 rounded-full mx-auto" />
        
        <div className="mt-auto flex justify-center">
          <div className="w-6 h-6 rounded-full bg-rose-500/50 flex items-center justify-center">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ScoreDeltaVisual() {
  return (
    <div className="flex flex-col gap-3 opacity-30 group-hover:opacity-100 transition-opacity duration-500 w-48">
      {[45, 78, 91].map((score, i) => (
        <div key={i} className="w-full bg-zinc-950/50 border border-white/5 rounded-lg p-3 flex items-center justify-between">
          <span className="text-xs font-mono text-zinc-500">Week {12 + i}</span>
          <div className="flex items-center gap-2">
            <div className="h-1 w-12 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 1, delay: i * 0.2 }}
                className={cn("h-full", score > 80 ? "bg-rose-500" : "bg-zinc-500")}
              />
            </div>
            <span className={cn("text-xs font-bold", score > 80 ? "text-rose-400" : "text-zinc-400")}>
              {score}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function TweetVisual() {
  return (
    <div className="relative w-48 opacity-30 group-hover:opacity-100 transition-all duration-500 group-hover:-translate-y-1">
      <div className="bg-zinc-950 border border-white/10 rounded-xl p-3 flex flex-col gap-2 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-zinc-800" />
          <div className="flex flex-col gap-1">
            <div className="w-16 h-1.5 bg-zinc-700 rounded-full" />
            <div className="w-10 h-1 bg-zinc-800 rounded-full" />
          </div>
        </div>
        <div className="flex flex-col gap-1 mt-1">
          <div className="w-full h-1.5 bg-zinc-700 rounded-full" />
          <div className="w-5/6 h-1.5 bg-zinc-700 rounded-full" />
          <div className="w-3/4 h-1.5 bg-rose-500/50 rounded-full mt-1" />
        </div>
      </div>
    </div>
  );
}

function StreakVisual() {
  return (
    <div className="relative flex items-center justify-center w-24 h-24 opacity-40 group-hover:opacity-100 transition-all duration-500">
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-2 border-dashed border-rose-500/30 rounded-full"
      />
      <div className="w-16 h-16 bg-zinc-900 border border-rose-500/30 rounded-full flex items-center justify-center relative z-10 shadow-[0_0_20px_rgba(244,63,94,0.2)]">
        <span className="text-2xl font-bold tracking-tighter text-rose-500">12</span>
      </div>
    </div>
  );
}
