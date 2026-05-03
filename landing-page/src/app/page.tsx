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
      <section className="py-24 px-4 md:px-8 max-w-4xl mx-auto w-full text-center flex flex-col items-center gap-6 relative">
        <div className="absolute inset-0 bg-rose-500/5 blur-3xl rounded-full" />
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border-2 border-rose-500/20 flex items-center justify-center mb-4 relative z-10 rotate-3">
          <ShieldCheck size={32} weight="duotone" className="text-rose-400" />
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-100 relative z-10">
          We don't want your data. <br/>
          <span className="text-zinc-500 text-2xl">It's frankly embarrassing.</span>
        </h2>
        <p className="text-zinc-400 leading-relaxed max-w-[65ch] relative z-10 text-lg">
          No account. No server. No creepy ad tracking. Everything lives locally in your own browser's <code className="text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded font-mono text-sm">storage</code>. ScrollShame can't see your search history. Nobody can. Except your browser. Which is currently writing your roast.
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
