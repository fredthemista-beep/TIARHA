'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CircleHelp, Landmark, LogOut, Search } from 'lucide-react';
import { PLAN_CONFIG } from '@tiarh/ui';
import { AGENTS, ORG, matchAgent, nomComplet } from '@/lib/demo-data';
import { showToast } from '@/components/ui/demo-toast';
import { createClient } from '@/lib/supabase/client';

interface TopbarProps {
  title: string;
  subtitle?: string;
  notifCount?: number;
}

const MAX_RESULTS = 6;

export function Topbar({ title, subtitle, notifCount = 0 }: TopbarProps) {
  const planConf = PLAN_CONFIG[ORG.plan];
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [shortcut, setShortcut] = useState('⌘ K');

  const profileRef = useRef<HTMLDivElement>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const results = useMemo(
    () => (query.trim() ? AGENTS.filter(a => matchAgent(a, query)).slice(0, MAX_RESULTS) : []),
    [query],
  );

  // ⌘K / Ctrl+K focalise la recherche.
  useEffect(() => {
    if (!/Mac|iPhone|iPad/.test(navigator.platform)) setShortcut('Ctrl K');
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Fermeture du menu profil au clic extérieur.
  useEffect(() => {
    if (!profileOpen) return;
    function onDown(e: MouseEvent) {
      if (!profileRef.current?.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [profileOpen]);

  function openAgent(id: string) {
    setQuery('');
    setSearchOpen(false);
    inputRef.current?.blur();
    router.push(`/agents/${id}`);
  }

  async function signOut() {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // Démo sans Supabase joignable : la redirection suffit.
    }
    router.push('/login');
  }

  const showResults = searchOpen && query.trim() !== '';

  return (
    <header className="app-topbar">
      <div className="topbar-mobile-brand" aria-label="TIARHA">
        <Landmark aria-hidden="true" />
        <strong>TIARHA</strong>
      </div>

      <div className="topbar-heading">
        <div className="topbar-breadcrumb">
          <span>{ORG.collectivite}</span>
          <span aria-hidden="true">/</span>
          <strong>{title}</strong>
        </div>
        {subtitle && <span className="topbar-subtitle">{subtitle}</span>}
      </div>

      <div className="topbar-search-wrap">
        <label className="topbar-search">
          <Search aria-hidden="true" />
          <span className="sr-only">Rechercher un agent</span>
          <input
            ref={inputRef}
            type="search"
            placeholder="Rechercher un agent, un dossier…"
            value={query}
            onChange={e => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setSearchOpen(false)}
            onKeyDown={e => {
              if (e.key === 'Enter' && results[0]) openAgent(results[0].id);
              if (e.key === 'Escape') { setQuery(''); inputRef.current?.blur(); }
            }}
            aria-controls="topbar-search-results"
            aria-expanded={showResults}
            role="combobox"
            aria-autocomplete="list"
          />
          <kbd>{shortcut}</kbd>
        </label>

        {showResults && (
          <div
            id="topbar-search-results"
            className="topbar-search-results"
            role="listbox"
            onMouseDown={e => e.preventDefault()}
          >
            {results.length === 0 ? (
              <div className="topbar-search-empty">Aucun agent ne correspond à « {query.trim()} ».</div>
            ) : (
              results.map(a => (
                <Link
                  key={a.id}
                  href={`/agents/${a.id}`}
                  role="option"
                  aria-selected={false}
                  className="topbar-search-result"
                  onClick={e => { e.preventDefault(); openAgent(a.id); }}
                >
                  <span
                    className="agent-avatar"
                    style={{ background: a.statut === 'tit' ? 'var(--indigo)' : 'var(--teal)' }}
                  >
                    {a.initiales}
                  </span>
                  <span>
                    <strong>{nomComplet(a)}</strong>
                    <small>{a.id} · {a.grade} · {a.service}</small>
                  </span>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      <div className="topbar-actions">
        <div className="legal-status" title="Référentiel juridique synchronisé">
          <span className="lgf-dot" />
          Textes à jour
        </div>
        <span
          className="plan-chip"
          style={{ '--plan-color': planConf.color } as React.CSSProperties}
          title="Accès démo — toutes les fonctionnalités sont ouvertes pendant la phase pilote"
        >
          {ORG.planLabel}
        </span>
        <button type="button" className="topbar-icon-button" aria-label="Aide" onClick={() => showToast()}>
          <CircleHelp aria-hidden="true" />
        </button>
        <button
          type="button"
          className="topbar-icon-button"
          aria-label={`Notifications : ${notifCount} non lues`}
          onClick={() => showToast()}
        >
          <Bell aria-hidden="true" />
          {notifCount > 0 && <span className="notification-count">{notifCount}</span>}
        </button>
        <div className="topbar-profile-wrap" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile"
            aria-label="Ouvrir le menu du profil de Fred Themista"
            aria-haspopup="menu"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen(o => !o)}
          >
            <span>FT</span>
            <span className="topbar-profile-copy">
              <strong>Fred Themista</strong>
              <small>Administrateur RH</small>
            </span>
          </button>
          {profileOpen && (
            <div className="topbar-profile-menu" role="menu">
              <div className="topbar-profile-menu-head">
                <strong>Fred Themista</strong>
                <small>Administrateur RH · {ORG.collectivite}</small>
              </div>
              <button type="button" role="menuitem" onClick={signOut} disabled={signingOut}>
                <LogOut aria-hidden="true" />
                {signingOut ? 'Déconnexion…' : 'Se déconnecter'}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
