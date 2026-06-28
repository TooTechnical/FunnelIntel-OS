import { FormEvent, useState } from "react";
import { Link, useLocation } from "wouter";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      setLocation("/dashboard");
    },
    onError: error => toast.error(error.message),
  });

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <div className="min-h-screen bg-cyber-black text-cyber-text flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 border border-cyber bg-cyber-dark p-6 rounded">
        <div>
          <h1 className="font-display text-2xl text-neon-pink">Login</h1>
          <p className="text-sm text-cyber-muted mt-1">Access your FunnelIntel OS workspace.</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required />
        </div>
        <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          Login
        </Button>
        <p className="text-sm text-cyber-muted text-center">
          No account? <Link href="/signup" className="text-neon-cyan hover:text-neon-pink">Start free trial</Link>
        </p>
      </form>
    </div>
  );
}
