import { NavBar } from "@/components/NavBar";
import { HeroInteractive } from "@/components/HeroInteractive";
import { MarqueeReview } from "@/components/MarqueeReview";
import { BentoGrid } from "@/components/BentoGrid";
import { FeatureBreakdown } from "@/components/FeatureBreakdown";
import { PricingCards } from "@/components/PricingCards";
import { FAQAccordion } from "@/components/FAQAccordion";
import { ShieldCheck } from "@phosphor-icons/react/dist/ssr";

export default function Home() {
  return (
    <main className="flex flex-col w-full overflow-hidden relative">
      <NavBar />
      <HeroInteractive />
      <MarqueeReview />
      <BentoGrid />
      <FeatureBreakdown />
      <PricingCards />
      
      {/* Privacy Section */}
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-6">
        <div className="w-16 h-16 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center mb-4">
          <ShieldCheck size={32} weight="duotone" className="text-zinc-400" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">
          Your data never leaves your browser.
        </h2>
        <p className="text-zinc-400 leading-relaxed max-w-[65ch]">
          No account. No server. No telemetry. No analytics. Everything lives in <code className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-mono text-sm">chrome.storage.local</code>. ScrollShame can't see your data. Nobody can. Except your browser. Which is, functionally, you.
        </p>
      </section>

      <FAQAccordion />

      {/* Footer */}
      <footer className="border-t border-white/5 bg-zinc-950 mt-16 py-16 px-4 md:px-8 flex flex-col items-center gap-8 text-center">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-100">
          Get your weekly receipt.
        </h3>
        <div className="flex flex-wrap justify-center gap-4 text-zinc-400 font-medium">
          <button className="text-rose-500 hover:text-rose-400 transition-colors">
            Install ScrollShame — Free
          </button>
          <span>·</span>
          <a href="https://scrollshame.com" className="hover:text-zinc-200 transition-colors">
            scrollshame.com
          </a>
        </div>
        <p className="text-sm text-zinc-600 mt-4 max-w-md">
          Chrome extension · Local only · No account needed · Your browser has been waiting to tell you something.
        </p>
      </footer>
    </main>
  );
}
