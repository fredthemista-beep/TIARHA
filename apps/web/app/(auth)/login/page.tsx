'use client';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-pagebg flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-md p-8 w-full max-w-sm border border-black/5">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
              <path d="M6 9h20M6 15h13M6 21h16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
              <circle cx="24" cy="21" r="3" fill="white"/>
            </svg>
          </div>
          <div>
            <p className="font-bold text-navy text-sm leading-tight">TIARH</p>
            <p className="text-[10px] text-muted">TerritorialRH Suite</p>
          </div>
        </div>

        {sent ? (
          <div className="text-center">
            <p className="text-sm font-semibold text-navy mb-2">Lien envoyé ✓</p>
            <p className="text-xs text-muted">Vérifiez votre boîte mail ({email}). Le lien expire dans 15 minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <h1 className="text-xl font-bold text-navy mb-1">Connexion</h1>
              <p className="text-xs text-muted">Entrez votre email professionnel pour recevoir un lien de connexion.</p>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email" className="text-xs font-medium text-navy">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="drh@mairie-exemple.fr"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-primary hover:bg-primary/90 text-white">
              {loading ? 'Envoi en cours...' : 'Recevoir le lien de connexion'}
            </Button>
          </form>
        )}

        <div className="mt-6 pt-4 border-t border-black/5 text-center">
          <p className="text-[10px] text-muted mb-2">Accès sans compte</p>
          <a
            href="/"
            className="inline-block w-full text-center text-xs font-medium text-navy border border-navy/20 rounded-lg py-2 hover:bg-navy/5 transition-colors"
          >
            Voir la démo
          </a>
        </div>
      </div>
    </div>
  );
}
