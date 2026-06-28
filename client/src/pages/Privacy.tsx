import { Link } from "wouter";
import { ArrowLeft, Shield } from "lucide-react";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/">
          <a className="inline-flex items-center gap-2 text-xs text-cyber-muted hover:text-neon-cyan transition-colors mb-8">
            <ArrowLeft className="w-3 h-3" /> Back to Home
          </a>
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded border border-neon-cyan/40 bg-neon-cyan/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <div className="text-xs text-cyber-muted font-display tracking-widest uppercase">Legal</div>
            <h1 className="font-display font-bold text-2xl text-neon-cyan tracking-widest">PRIVACY POLICY</h1>
          </div>
        </div>

        <div className="hud-card hud-card-cyan p-8 space-y-8 text-sm text-cyber-muted leading-relaxed">
          <div>
            <p className="text-xs text-cyber-muted mb-4">Last updated: {new Date().toLocaleDateString("en-GB", { year: "numeric", month: "long", day: "numeric" })}</p>
            <p>FunnelIntel OS ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our Service.</p>
          </div>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">1. Information We Collect</h2>
            <p className="mb-2">We collect the following types of information:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><strong className="text-cyber-text">Account information:</strong> Name, email address, and login method provided during registration.</li>
              <li><strong className="text-cyber-text">Project data:</strong> Research inputs, AI-generated outputs, and project configurations you create.</li>
              <li><strong className="text-cyber-text">Usage data:</strong> Pages visited, features used, and session information.</li>
              <li><strong className="text-cyber-text">Billing information:</strong> Subscription status and payment history (payment details are handled by Stripe and never stored by us).</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">2. How We Use Your Information</h2>
            <p className="mb-2">We use your information to:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Provide, operate, and improve the Service</li>
              <li>Process your subscription and billing</li>
              <li>Send important account and service notifications</li>
              <li>Respond to support requests</li>
              <li>Analyse usage patterns to improve the product</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">3. AI Processing</h2>
            <p>Your research inputs are sent to AI processing services to generate outputs. These inputs may be processed by third-party AI providers under their respective privacy policies. We do not use your data to train AI models without your explicit consent.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">4. Data Storage and Security</h2>
            <p>Your data is stored in secure, encrypted databases. We implement industry-standard security measures including HTTPS encryption, secure authentication, and access controls. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">5. Third-Party Services</h2>
            <p className="mb-2">We use the following third-party services:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li><strong className="text-cyber-text">Stripe:</strong> Payment processing. Subject to Stripe's Privacy Policy.</li>
              <li><strong className="text-cyber-text">AI Providers:</strong> AI text generation. Research inputs are processed to generate outputs.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">6. Data Retention</h2>
            <p>We retain your account data and project data for as long as your account is active. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">7. Your Rights</h2>
            <p className="mb-2">Depending on your location, you may have the right to:</p>
            <ul className="space-y-1 list-disc list-inside text-xs">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to or restrict processing of your data</li>
              <li>Data portability</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">8. Cookies</h2>
            <p>We use session cookies to maintain your authentication state. These are essential for the Service to function. We do not use advertising or tracking cookies.</p>
          </section>

          <section>
            <h2 className="font-display text-sm tracking-widest uppercase text-neon-pink mb-3">9. Contact</h2>
            <p>If you have questions about this Privacy Policy or wish to exercise your data rights, please contact us through the support channels listed on our website.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
