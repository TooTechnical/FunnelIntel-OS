import { Link } from "wouter";
import { ArrowLeft, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-xs text-cyber-muted hover:text-neon-cyan transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </a>
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded border border-neon-pink/40 bg-neon-pink/10 flex items-center justify-center">
            <FileText className="w-5 h-5 text-neon-pink" />
          </div>
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-widest uppercase">Legal</div>
            <h1 className="font-display font-bold text-2xl text-neon-pink tracking-widest">TERMS OF SERVICE</h1>
          </div>
        </div>

        <div className="hud-card p-8 space-y-8 text-sm text-cyber-muted leading-relaxed">
          <div>
            <p className="text-xs text-cyber-muted mb-4">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p>By accessing or using FunnelIntel OS ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </div>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">1. Description of Service</h2>
            <p>FunnelIntel OS is an AI-powered customer intelligence and funnel engineering SaaS platform. The Service allows users to analyse customer research, generate buyer journey maps, diagnose awareness levels, identify threshold gaps, and produce marketing copy and funnel strategies.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">2. Account Registration</h2>
            <p>You must create an account to access the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must provide accurate and complete information when creating your account.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">3. Free Trial</h2>
            <p>New users receive a 2-day free trial upon registration. During the trial, you may create projects and generate AI outputs. After the trial expires, you must subscribe to a paid plan to continue generating new AI outputs. You may continue to view previously generated data after trial expiry.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">4. Subscriptions and Billing</h2>
            <p>Paid subscriptions are billed monthly. Payments are processed securely via Stripe. You may cancel your subscription at any time through the billing portal. Cancellation takes effect at the end of the current billing period. No refunds are provided for partial months.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">5. Acceptable Use</h2>
            <p>You agree not to use the Service for any unlawful purpose, to violate any applicable laws, to infringe on intellectual property rights, or to generate content that is harmful, deceptive, or fraudulent. We reserve the right to suspend or terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">6. AI-Generated Content</h2>
            <p>The Service uses AI to generate marketing copy, funnel strategies, and other content. You are responsible for reviewing, editing, and ensuring the accuracy of all AI-generated content before use. FunnelIntel OS does not guarantee the accuracy, completeness, or fitness for purpose of any AI-generated output.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">7. Intellectual Property</h2>
            <p>You retain ownership of all research data and content you input into the Service. You own the AI-generated outputs produced from your inputs. FunnelIntel OS retains all rights to the platform, software, and underlying technology.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">8. Limitation of Liability</h2>
            <p>The Service is provided "as is" without warranties of any kind. FunnelIntel OS shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including but not limited to loss of profits, data, or business opportunities.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">9. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through the Service. Continued use of the Service after changes constitutes acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-cyan mb-3">10. Contact</h2>
            <p>If you have questions about these Terms, please contact us through the support channels listed on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
