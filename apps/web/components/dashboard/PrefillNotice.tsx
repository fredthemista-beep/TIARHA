'use client';

import Link from 'next/link';
import { getAgent, nomComplet } from '@/lib/demo-data';

/** Bandeau « Pré-rempli depuis le dossier de … » affiché en tête d'un simulateur. */
export function PrefillNotice({ agentId, extra }: { agentId: string | null; extra?: string }) {
  const agent = getAgent(agentId);
  if (!agent) return null;
  return (
    <div className="notice-info" role="status" style={{ alignItems: 'center', marginTop: 0, marginBottom: 16, fontSize: 12 }}>
      <span aria-hidden="true">👤</span>
      <div style={{ flex: 1 }}>
        Pré-rempli depuis le dossier de <strong>{nomComplet(agent)}</strong> ({agent.id} · {agent.grade})
        {extra && <> — {extra}</>}
      </div>
      <Link
        href={`/agents/${agent.id}`}
        style={{ fontSize: 12, fontWeight: 700, color: 'var(--indigo)', textDecoration: 'none', whiteSpace: 'nowrap' }}
      >
        ← Retour au dossier
      </Link>
    </div>
  );
}
