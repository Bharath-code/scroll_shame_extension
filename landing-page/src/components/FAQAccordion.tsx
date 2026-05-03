"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CaretDown } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Does it actually track my browsing history?",
    answer: "No. It tracks aggregate behaviours: peak tab counts, session lengths, scroll velocity events, and night-time activity. It does not read page content or URLs."
  },
  {
    question: "Is my data stored online?",
    answer: "No. Everything is stored locally in Chrome's extension storage. It never leaves your browser."
  },
  {
    question: "What happens if I miss a week?",
    answer: "Your streak resets. The report is still there. We don't hold grudges."
  },
  {
    question: "Why is my chaos score so high?",
    answer: "Look inward. You know why."
  },
  {
    question: "Can I just delete my history before Monday?",
    answer: "You can. But the extension remembers. We see the 0 tabs. We know what you're hiding. That's a different kind of chaos."
  },
  {
    question: "Can I share my report?",
    answer: "Yes. Copy as image, or post directly to X. Your Chaos Certificate is also shareable. Several people have done this. We don't judge. (We do, a little.)"
  },
  {
    question: "What is Roast Remix Mode?",
    answer: "All 5 voices commenting on the same week, shown as a stacked panel. It's a chorus of concern. Pro feature."
  },
  {
    question: "Will there be more voices?",
    answer: "Yes. Chaos Pass holders get first access."
  }
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-32 px-4 md:px-8 max-w-3xl mx-auto w-full flex flex-col gap-12">
      <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-100 text-center">
        Frequently Asked <span className="text-rose-500 line-through decoration-zinc-500">Questions</span> Excuses
      </h2>

      <div className="flex flex-col border-t border-white/5">
        {FAQS.map((faq, i) => {
          const isOpen = openIndex === i;
          return (
            <div key={i} className="border-b border-white/5">
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between py-6 text-left group cursor-pointer"
              >
                <span className="text-lg font-medium tracking-tight text-zinc-200 group-hover:text-rose-400 transition-colors">
                  {faq.question}
                </span>
                <motion.div
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-rose-500/30"
                >
                  <CaretDown size={16} className="text-zinc-500 group-hover:text-rose-400" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 text-zinc-400 leading-relaxed max-w-[55ch]">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </section>
  );
}
