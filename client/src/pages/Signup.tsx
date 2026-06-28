import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Signup() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const signupMutation = trpc.auth.signup.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/dashboard");
    },
    onError: error => toast.error(error.message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    signupMutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 border border-cyber bg-cyber-dark p-6 rounded">
        <div>
          <h1 className="font-display text-2xl text-neon-pink">Start Free Trial</h1>
          <p className="text-sm text-cyber-muted mt-1">Create a local account with a 2-day trial.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={event => setPassword(event.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={signupMutation.isPending}>
          {signupMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Create Account
        </Button>
        <p className="text-sm text-cyber-muted text-center">
          Already have an account? <Link href="/login" className="text-neon-cyan hover:text-neon-pink">Login</Link>
        </p>
      </form>
    </div>
  );
}
