"use client";

import { motion } from "framer-motion";
import { Browser } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

export function NavBar() {
  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-8 py-4 bg-zinc-950/50 backdrop-blur-md border-b border-white/5"
    >
      <div className="flex items-center gap-2 text-zinc-100 font-bold tracking-tight text-lg cursor-pointer">
        <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
          <Browser size={20} weight="duotone" />
        </div>
        ScrollShame
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
        <a href="#features" className="hover:text-zinc-100 transition-colors cursor-pointer">Features</a>
        <a href="#pricing" className="hover:text-zinc-100 transition-colors cursor-pointer">Pricing</a>
        <a href="#faq" className="hover:text-zinc-100 transition-colors cursor-pointer">FAQ</a>
      </div>

      <div className="flex items-center gap-4">
        <button className="hidden md:block text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer">
          Login
        </button>
        <button className="px-4 py-2 bg-zinc-100 text-zinc-900 rounded-full text-sm font-bold tracking-tight hover:bg-zinc-200 transition-colors cursor-pointer">
          Get Free
        </button>
      </div>
    </motion.nav>
  );
}
