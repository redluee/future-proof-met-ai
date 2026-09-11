"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-context";
import { Lock, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isAuthenticated) {
    router.replace("/");
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        router.push("/");
        router.refresh();
      } else {
        setError(result.error || "Ongeldige inloggegevens");
      }
    } catch {
      setError("Inloggen mislukt. Probeer het opnieuw.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md">
        <div className="bg-[#111111] border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#00e3a4]/10 border border-[#00e3a4]/20 mx-auto mb-6">
            <Lock className="w-6 h-6 text-[#00e3a4]" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-center text-white mb-2">
            Minor Beheer
          </h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            Log in om wijzigingen en updates aan te brengen in het portfolio.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
                Gebruikersnaam
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                required
                placeholder="Steven"
                className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00e3a4] focus:ring-1 focus:ring-[#00e3a4] transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2">
                Wachtwoord
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#181818] border border-white/10 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-[#00e3a4] focus:ring-1 focus:ring-[#00e3a4] transition-all text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password}
              className="w-full mt-4 flex items-center justify-center gap-2 py-3.5 px-4 bg-[#00e3a4] text-black font-semibold rounded-xl hover:bg-[#03f5b0] active:bg-[#005f4e] active:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSubmitting ? (
                "Bezig met inloggen..."
              ) : (
                <>
                  <span>Inloggen</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-2 text-xs text-zinc-500">
            <ShieldCheck className="w-4 h-4 text-zinc-500" />
            <span>Beveiligde beheerderstoegang</span>
          </div>
        </div>
      </div>
    </div>
  );
}
