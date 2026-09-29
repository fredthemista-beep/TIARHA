// apps/web/app/(dashboard)/settings/page.tsx
import { Topbar } from '@/components/dashboard/Topbar';
import { PLAN_CONFIG } from '@tiarh/ui';

export default function SettingsPage() {
  const plans = Object.entries(PLAN_CONFIG);
  return (
    <>
      <Topbar title="Paramètres" subtitle="Abonnement et facturation" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl flex flex-col gap-6">
          <div className="notice-info" role="status" style={{ marginTop: 0, fontSize: 12 }}>
            <span aria-hidden="true">ℹ️</span>
            <div>Accès démo — toutes les fonctionnalités sont ouvertes pendant la phase pilote.</div>
          </div>
          <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
            <p className="text-sm font-bold text-navy mb-1">Offres à venir</p>
            <p className="text-[11px] text-muted mb-4">À titre d’information : aucune offre payante n’est encore ouverte à la souscription.</p>
            <div className="grid grid-cols-4 gap-3">
              {plans.map(([id, plan]) => (
                <div key={id} className="rounded-xl p-4 border flex flex-col gap-2" style={{ borderColor: plan.color + '40', background: plan.color + '08' }}>
                  <p className="text-xs font-bold uppercase tracking-wide" style={{ color: plan.color }}>{plan.name}</p>
                  <p className="text-lg font-bold text-navy font-mono">{plan.price}</p>
                  <p className="text-[11px] text-muted">{plan.agents} agents</p>
                  <p className="text-[11px] text-muted">Jusqu&apos;à {plan.appLimit} apps</p>
                  <button
                    type="button"
                    disabled
                    title="Offres payantes bientôt disponibles"
                    className="mt-2 text-center text-xs font-semibold py-2 rounded-lg border cursor-not-allowed"
                    style={{ color: plan.color, borderColor: plan.color + '40', background: 'transparent', opacity: 0.7 }}
                  >
                    Bientôt disponible
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
