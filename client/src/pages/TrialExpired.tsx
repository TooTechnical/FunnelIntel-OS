import { AlertTriangle, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function TrialExpired() {
  return (
    <div className="min-h-screen bg-cyber-black flex items-center justify-center p-6">
      <div className="hud-card border-neon-pink/40 p-10 max-w-md w-full text-center">
        <AlertTriangle className="w-12 h-12 text-neon-pink mx-auto mb-6" />
        <h1 className="font-display font-bold text-2xl text-neon-pink tracking-widest mb-3">TRIAL EXPIRED</h1>
        <p className="text-cyber-muted text-sm leading-relaxed mb-8">
          Your 2-day free trial has ended. You can still view your existing project data, but you cannot generate new AI outputs until you choose a paid plan.
        </p>
        <Link href="/pricing">
          <a className="btn-neon-solid px-8 py-3 rounded text-sm flex items-center gap-2 justify-center">
            Choose a Plan <ArrowRight className="w-4 h-4" />
          </a>
        </Link>
        <Link href="/dashboard">
          <a className="block mt-4 text-xs text-cyber-muted hover:text-neon-cyan transition-colors">
            Back to Dashboard
          </a>
        </Link>
      </div>
    </div>
  );
}
