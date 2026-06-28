import { getLoginUrl } from "@/const";
import {
  ArrowRight,
  BookOpen,
  Brain,
  ChevronDown,
  ChevronUp,
  FileText,
  Layers,
  Network,
  PenTool,
  Search,
  Shield,
  Swords,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

// ─── HUD Corner Component ──────────────────────────────────────────────────
function HudFrame({ children, color = "pink", className = "" }: { children: React.ReactNode; color?: "pink" | "cyan"; className?: string }) {
  const c = color === "pink"
    ? "before:border-neon-pink/60 after:border-neon-pink/60"
    : "before:border-neon-cyan/60 after:border-neon-cyan/60";
  return (
    <div className={`hud-card ${c} ${className}`}>
      {children}
    </div>
  );
}

// ─── Neon Badge ────────────────────────────────────────────────────────────
function NeonBadge({ children, color = "pink" }: { children: React.ReactNode; color?: "pink" | "cyan" }) {
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-display tracking-widest uppercase border rounded ${
      color === "pink"
        ? "border-neon-pink/50 text-neon-pink bg-neon-pink/5"
        : "border-neon-cyan/50 text-neon-cyan bg-neon-cyan/5"
    }`}>
      {children}
    </span>
  );
}

// ─── Feature Cards ─────────────────────────────────────────────────────────
const FEATURES = [
  { icon: BookOpen, title: "Research Extractor", desc: "Paste reviews, interviews, forum posts. AI extracts exact customer language, pains, desires, and objections — structured, not a wall of text.", color: "pink" as const },
  { icon: Network, title: "Buyer Journey Mapper", desc: "Map all 8 buyer journey stages: trigger, search, doubts, decision, action. See what customers thought, felt, and said at each step.", color: "cyan" as const },
  { icon: TrendingUp, title: "Threshold Gap Analysis", desc: "Score desire, certainty, and trust gaps. Identify the biggest gap and let the system tell you exactly what your funnel must fix.", color: "pink" as const },
  { icon: Zap, title: "Mental Steps + Triggers", desc: "Build the ordered chain of mental steps a prospect must take before acting. Map triggers, funnel elements, and copy angles to each step.", color: "cyan" as const },
  { icon: PenTool, title: "Drafting Studio", desc: "Generate copy element by element — not all at once. Every asset shows its job, the mental step it triggers, and 2–4 variations.", color: "pink" as const },
  { icon: Search, title: "Self-Review Checker", desc: "Run 5-category review: lizard brain scan, baton handoff, threshold check, language precision, final pass. Score, issues, fixes, rewrite.", color: "cyan" as const },
  { icon: Swords, title: "Competitor Comparison", desc: "Paste your ad and competitor ads. Generate insider review questions. Store feedback and diagnose the winning variation.", color: "pink" as const },
  { icon: FileText, title: "Strategy Report Export", desc: "Export a complete 13-section strategy report as PDF or Markdown. Every insight, journey stage, and draft asset in one document.", color: "cyan" as const },
];

// ─── Use Cases ─────────────────────────────────────────────────────────────
const USE_CASES = [
  { icon: "🎨", role: "Freelance Web Designers", desc: "Stop writing generic copy for client sites. Use customer research to position every project with precision." },
  { icon: "🏢", role: "Small Agencies", desc: "Build funnels and landing pages backed by real buyer intelligence, not assumptions." },
  { icon: "✍️", role: "Copywriters", desc: "Do the strategic work before writing. Extract exact customer language and build the mental chain first." },
  { icon: "🚀", role: "Startup Founders", desc: "Validate your offer messaging before you spend on ads. Understand what your market actually needs to hear." },
  { icon: "💼", role: "Coaches & Consultants", desc: "Engineer your sales page around the real gaps between where your client is and where they want to be." },
  { icon: "🏪", role: "Small Business Owners", desc: "Stop sounding like everyone else. Use real customer language to write marketing that actually converts." },
];

// ─── Pricing ───────────────────────────────────────────────────────────────
const PLANS = [
  {
    name: "Starter",
    price: "€19",
    period: "/month",
    color: "cyan" as const,
    features: ["3 projects", "Basic research analysis", "Funnel strategy output", "Ad and landing page drafts", "2-day free trial"],
    cta: "Start Free Trial",
  },
  {
    name: "Pro",
    price: "€49",
    period: "/month",
    color: "pink" as const,
    popular: true,
    features: ["20 projects", "Interview builder", "Threshold analysis", "Mental steps and triggers", "Self-review checker", "Export reports", "2-day free trial"],
    cta: "Start Free Trial",
  },
  {
    name: "Agency",
    price: "€149",
    period: "/month",
    color: "cyan" as const,
    features: ["Unlimited projects", "Client workspaces", "Competitor comparison", "Insider review board", "PDF/Markdown export", "Team members (coming soon)", "2-day free trial"],
    cta: "Start Free Trial",
  },
];

// ─── FAQ ───────────────────────────────────────────────────────────────────
const FAQ = [
  { q: "Is this just an AI copywriter?", a: "No. FunnelIntel OS is a strategic funnel engineering system that guides the thinking before the copy is written. It forces you through a structured process — research, buyer journey, threshold analysis, mental steps — before generating a single word of copy." },
  { q: "Do I need marketing experience?", a: "No. The app guides you step by step through every module. Each stage explains what it is, why it matters, and what to do next. You don't need to know what 'awareness level' or 'threshold gap' means — the system teaches you as you work." },
  { q: "Can agencies use it for clients?", a: "Yes. The Agency plan gives you unlimited projects and client workspaces. Each project is self-contained with its own research, strategy, drafts, and export report." },
  { q: "What happens after the 2-day trial?", a: "After your trial ends, you can still view your existing project data but you cannot generate new AI outputs until you choose a paid plan. Your data is never deleted." },
  { q: "What kind of research can I paste in?", a: "Customer reviews, interview notes, sales call transcripts, Reddit/YouTube/Trustpilot comments, competitor website copy, client notes, testimonials, survey answers, and general market research." },
  { q: "How is this different from ChatGPT?", a: "ChatGPT is a blank chat box. FunnelIntel OS is a structured operating system. Every module has a specific job. The AI outputs are saved to your project as structured cards — not a wall of text you have to copy-paste somewhere else." },
];

// ─── How It Works Steps ────────────────────────────────────────────────────
const HOW_IT_WORKS = [
  { step: "01", title: "Add Research", desc: "Paste customer reviews, interviews, forum posts, competitor copy." },
  { step: "02", title: "Extract Intelligence", desc: "AI extracts exact phrases, pains, desires, objections, and awareness level." },
  { step: "03", title: "Map the Buyer Journey", desc: "Trace every stage from trigger to action with thoughts, feelings, and language." },
  { step: "04", title: "Diagnose Gaps", desc: "Score desire, certainty, and trust. Find the biggest gap your funnel must close." },
  { step: "05", title: "Build the Mental Chain", desc: "Generate the ordered mental steps your prospect must take before acting." },
  { step: "06", title: "Draft Assets", desc: "Generate copy element by element — ads, landing page, email, CTA — with variations." },
  { step: "07", title: "Self-Review", desc: "Run a 5-category review. Get a score, issues, fixes, and a rewritten version." },
  { step: "08", title: "Validate & Launch", desc: "Compare against competitors, collect insider feedback, export your strategy report." },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text overflow-x-hidden">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-cyber bg-cyber-black/90 backdrop-blur-sm">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 relative shrink-0">
              <div className="absolute inset-0 border border-neon-pink/60 rotate-45 box-glow-sm-pink" />
              <span className="absolute inset-0 flex items-center justify-center text-neon-pink font-display font-bold text-xs">F</span>
            </div>
            <span className="font-display font-bold text-sm text-neon-pink glow-sm-pink tracking-widest">FUNNELINTEL OS</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-xs font-display text-cyber-muted hover:text-neon-cyan transition-colors tracking-wide">HOW IT WORKS</a>
            <a href="#features" className="text-xs font-display text-cyber-muted hover:text-neon-cyan transition-colors tracking-wide">FEATURES</a>
            <a href="#pricing" className="text-xs font-display text-cyber-muted hover:text-neon-cyan transition-colors tracking-wide">PRICING</a>
          </div>
          <div className="flex items-center gap-3">
            <a href={getLoginUrl()} className="text-xs font-display text-cyber-muted hover:text-neon-cyan transition-colors tracking-wide hidden sm:block">LOGIN</a>
            <a
              href={getLoginUrl()}
              className="btn-neon-solid px-4 py-2 rounded text-xs"
            >
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center pt-16 cyber-grid overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-neon-pink/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl pointer-events-none" />

        <div className="container relative z-10 py-24">
          <div className="max-w-4xl">
            <NeonBadge color="cyan">Customer Intelligence Platform</NeonBadge>
            <h1 className="mt-6 font-display font-black text-4xl md:text-6xl lg:text-7xl leading-tight tracking-tight">
              <span className="text-neon-pink glow-pink">Stop guessing</span>
              <br />
              <span className="text-cyber-text">what your customers</span>
              <br />
              <span className="gradient-text-cyber">need to hear.</span>
            </h1>
            <p className="mt-6 text-lg text-cyber-muted max-w-2xl leading-relaxed">
              FunnelIntel OS turns customer research, interviews, reviews, and competitor analysis into validated funnels, ads, landing pages, and offers — engineered around <span className="text-neon-pink">desire</span>, <span className="text-neon-cyan">certainty</span>, and <span className="text-neon-purple">trust</span>.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a href={getLoginUrl()} className="btn-neon-solid px-8 py-3 rounded text-sm flex items-center gap-2">
                Start Free 2-Day Trial <ArrowRight className="w-4 h-4" />
              </a>
              <a href="#how-it-works" className="btn-neon-cyan px-8 py-3 rounded text-sm flex items-center gap-2">
                See How It Works
              </a>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-cyber-muted">
              <span className="flex items-center gap-1"><span className="text-neon-cyan">✓</span> No credit card required</span>
              <span className="flex items-center gap-1"><span className="text-neon-cyan">✓</span> 2-day free trial</span>
              <span className="flex items-center gap-1"><span className="text-neon-cyan">✓</span> Cancel anytime</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-80 hidden xl:block opacity-40">
            <div className="space-y-3">
              {["DESIRE GAP: 7/10", "CERTAINTY GAP: 4/10", "TRUST GAP: 6/10"].map((label, i) => (
                <HudFrame key={i} color={i === 1 ? "pink" : "cyan"} className="p-3">
                  <div className="text-xs font-display text-neon-cyan tracking-widest">{label}</div>
                  <div className="mt-1 h-1 bg-cyber-border rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${i === 1 ? "bg-neon-pink" : "bg-neon-cyan"}`}
                      style={{ width: `${[70, 40, 60][i]}%` }}
                    />
                  </div>
                </HudFrame>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Problem ──────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-cyber">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <NeonBadge color="pink">The Problem</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              Most marketing is written from <span className="text-neon-pink glow-sm-pink">instinct.</span>
            </h2>
            <p className="mt-4 text-cyber-muted text-lg leading-relaxed">
              That is why it sounds generic. "Professional websites." "High quality service." "We help businesses grow." "Modern solutions." These phrases say nothing because they come from the marketer's head, not the customer's mouth.
            </p>
            <p className="mt-4 text-cyber-muted text-lg leading-relaxed">
              FunnelIntel OS forces you through a structured strategic process before generating a single word of copy. It helps you understand who you are targeting, where they are mentally right now, and what must happen inside their mind before they act.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-24 border-t border-cyber bg-cyber-dark/30">
        <div className="container">
          <div className="text-center mb-16">
            <NeonBadge color="cyan">The System</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              How <span className="text-neon-cyan glow-sm-cyan">FunnelIntel OS</span> works
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((item, i) => (
              <HudFrame key={i} color={i % 2 === 0 ? "pink" : "cyan"} className="p-5">
                <div className={`font-display font-black text-3xl ${i % 2 === 0 ? "text-neon-pink/30" : "text-neon-cyan/30"}`}>{item.step}</div>
                <div className="mt-2 font-display font-bold text-sm text-cyber-text tracking-wide">{item.title}</div>
                <p className="mt-2 text-xs text-cyber-muted leading-relaxed">{item.desc}</p>
              </HudFrame>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-cyber">
        <div className="container">
          <div className="text-center mb-16">
            <NeonBadge color="pink">Core Modules</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              Every tool you need to <span className="text-neon-pink glow-sm-pink">engineer conversion</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURES.map((f, i) => (
              <HudFrame key={i} color={f.color} className="p-5 hover:bg-cyber-surface transition-colors group">
                <div className={`w-10 h-10 rounded border flex items-center justify-center mb-4 ${
                  f.color === "pink"
                    ? "border-neon-pink/40 bg-neon-pink/10 text-neon-pink"
                    : "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
                }`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-display font-bold text-sm text-cyber-text tracking-wide">{f.title}</h3>
                <p className="mt-2 text-xs text-cyber-muted leading-relaxed">{f.desc}</p>
              </HudFrame>
            ))}
          </div>
        </div>
      </section>

      {/* ── Use Cases ────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-cyber bg-cyber-dark/30">
        <div className="container">
          <div className="text-center mb-16">
            <NeonBadge color="cyan">Who It's For</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              Built for <span className="text-neon-cyan glow-sm-cyan">conversion professionals</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {USE_CASES.map((uc, i) => (
              <HudFrame key={i} color={i % 2 === 0 ? "pink" : "cyan"} className="p-5">
                <div className="text-2xl mb-3">{uc.icon}</div>
                <h3 className="font-display font-bold text-sm text-cyber-text tracking-wide">{uc.role}</h3>
                <p className="mt-2 text-xs text-cyber-muted leading-relaxed">{uc.desc}</p>
              </HudFrame>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="py-24 border-t border-cyber">
        <div className="container">
          <div className="text-center mb-16">
            <NeonBadge color="pink">Pricing</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              Start free. <span className="text-neon-pink glow-sm-pink">Scale when ready.</span>
            </h2>
            <p className="mt-4 text-cyber-muted">Every plan includes a 2-day free trial. No credit card required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan, i) => (
              <div key={i} className={`relative ${plan.popular ? "scale-105" : ""}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                    <span className="btn-neon-solid px-4 py-1 rounded text-xs">MOST POPULAR</span>
                  </div>
                )}
                <HudFrame color={plan.color} className={`p-6 h-full flex flex-col ${plan.popular ? "border-neon-pink/60 box-glow-sm-pink" : ""}`}>
                  <div className={`font-display font-black text-xl tracking-widest ${plan.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>
                    {plan.name}
                  </div>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="font-display font-black text-4xl text-cyber-text">{plan.price}</span>
                    <span className="text-cyber-muted text-sm">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-3 flex-1">
                    {plan.features.map((f, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-cyber-muted">
                        <span className={`mt-0.5 shrink-0 ${plan.color === "pink" ? "text-neon-pink" : "text-neon-cyan"}`}>▸</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={getLoginUrl()}
                    className={`mt-6 w-full text-center py-3 rounded text-xs font-display tracking-widest uppercase transition-all ${
                      plan.popular ? "btn-neon-solid" : plan.color === "pink" ? "btn-neon-pink" : "btn-neon-cyan"
                    }`}
                  >
                    {plan.cta}
                  </a>
                </HudFrame>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-cyber bg-cyber-dark/30">
        <div className="container">
          <div className="text-center mb-16">
            <NeonBadge color="cyan">FAQ</NeonBadge>
            <h2 className="mt-6 font-display font-bold text-3xl md:text-4xl text-cyber-text">
              Common <span className="text-neon-cyan glow-sm-cyan">questions</span>
            </h2>
          </div>
          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ.map((item, i) => (
              <HudFrame key={i} color={i % 2 === 0 ? "pink" : "cyan"} className="overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-display text-sm text-cyber-text tracking-wide">{item.q}</span>
                  {openFaq === i
                    ? <ChevronUp className="w-4 h-4 text-neon-pink shrink-0" />
                    : <ChevronDown className="w-4 h-4 text-cyber-muted shrink-0" />
                  }
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 text-sm text-cyber-muted leading-relaxed border-t border-cyber pt-4">
                    {item.a}
                  </div>
                )}
              </HudFrame>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-cyber relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-neon-pink/5 blur-3xl" />
        <div className="container relative z-10 text-center">
          <h2 className="font-display font-black text-3xl md:text-5xl">
            <span className="text-neon-pink glow-pink">Engineer the message</span>
            <br />
            <span className="text-cyber-text">before you write the copy.</span>
          </h2>
          <p className="mt-6 text-cyber-muted text-lg max-w-xl mx-auto">
            Join marketers, agencies, and founders who build funnels from customer intelligence — not instinct.
          </p>
          <div className="mt-10 flex flex-wrap gap-4 justify-center">
            <a href={getLoginUrl()} className="btn-neon-solid px-10 py-4 rounded text-sm flex items-center gap-2">
              Start Free 2-Day Trial <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-cyber py-10">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 relative">
              <div className="absolute inset-0 border border-neon-pink/60 rotate-45" />
              <span className="absolute inset-0 flex items-center justify-center text-neon-pink font-display font-bold text-xs">F</span>
            </div>
            <span className="font-display text-xs text-neon-pink tracking-widest">FUNNELINTEL OS</span>
          </div>
          <p className="text-xs text-cyber-muted">
            Customer intelligence for funnels that convert.
          </p>
          <div className="flex gap-4 text-xs text-cyber-muted">
            <a href="#pricing" className="hover:text-neon-cyan transition-colors">Pricing</a>
            <a href="#features" className="hover:text-neon-cyan transition-colors">Features</a>
            <a href={getLoginUrl()} className="hover:text-neon-pink transition-colors">Login</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
