"use client";

import { motion } from "framer-motion";

const REVIEWS = [
  { text: `"My chaos score was 91. I printed the certificate."`, author: "anonymous" },
  { text: `"Two months of this. My browser has a file."`, author: "week 8 streak" },
  { text: `"I thought I was doing well until I saw the tab count."`, author: "still in denial" },
  { text: `"It's like looking in a mirror that is very disappointed in me."`, author: "score 84" },
];

export function MarqueeReview() {
  return (
    <div className="w-full border-y border-white/5 py-8 overflow-hidden bg-zinc-950 flex relative">
      {/* Gradients for fade effect on edges */}
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-zinc-950 to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-zinc-950 to-transparent z-10" />
      
      <motion.div
        className="flex gap-12 sm:gap-24 items-center whitespace-nowrap px-12"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ ease: "linear", duration: 30, repeat: Infinity }}
      >
        {/* Double the array for seamless infinite looping */}
        {[...REVIEWS, ...REVIEWS].map((review, idx) => (
          <div key={idx} className="flex items-center gap-4">
            <span className="text-zinc-400 font-medium text-lg tracking-tight">
              {review.text}
            </span>
            <span className="text-zinc-600 text-sm">— {review.author}</span>
            {/* Separator dot */}
            <span className="w-1 h-1 rounded-full bg-zinc-800 ml-4 sm:ml-12" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
