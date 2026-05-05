import { Topbar } from '@/components/dashboard/Topbar';
import { KpiCard, colors } from '@tiarh/ui';

// Placeholder data — replace with Supabase queries
const MOCK_KPIS = [
  { label: 'Masse salariale',   value: '1.24 M€', sub: 'CNRACL 30.65% inclus', trend: 2.4,  color: colors.primary,  spark: [48,52,49,55,58,54,60,57,63,61,66,64] },
  { label: 'Arrêts en cours',   value: '23',       sub: 'dont 4 CLM actifs',    trend: -8,   color: colors.accent,   spark: [31,28,30,26,27,24,25,23,26,24,25,23] },
  { label: 'CET accumulés',     value: '418 j',    sub: 'Plafond 60j/agent',    trend: 1.2,  color: colors.midBlue,  spark: [310,330,350,370,385,395,400,405,410,412,415,418] },
  { label: 'Vérifs Légifrance', value: '12',       sub: 'Ce jour — PISTE API',  trend: 15,   color: colors.success,  spark: [4,6,5,8,7,9,8,11,10,12,11,12] },
];

const TODAY = new Intl.DateTimeFormat('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());

export default function DashboardPage() {
  return (
    <>
      <Topbar title="Tableau de bord" subtitle={TODAY} plan="pro" notifCount={3} />
      <main className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">

        {/* Welcome banner */}
        <div className="bg-navy rounded-xl p-5 flex items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">Métropole de Lyon</p>
            <p className="text-[18px] font-bold text-white mt-0.5">Bienvenue, Fred 👋</p>
            <p className="text-[12px] text-white/60 mt-0.5">CDG 09 — Ariège</p>
          </div>
          <div className="flex gap-6">
            {[
              { val: '1 247', label: 'Agents actifs' },
              { val: '3', label: 'Services RH' },
              { val: '4,92278 €', label: 'Point indice' },
            ].map((item, i, arr) => (
              <div key={item.label} className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-[22px] font-bold text-white font-mono">{item.val}</p>
                  <p className="text-[10px] text-white/60">{item.label}</p>
                </div>
                {i < arr.length - 1 && <div className="w-px h-10 bg-white/20" />}
              </div>
            ))}
          </div>
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-4 gap-4">
          {MOCK_KPIS.map(kpi => (
            <KpiCard
              key={kpi.label}
              label={kpi.label}
              value={kpi.value}
              sub={kpi.sub}
              trend={kpi.trend}
              accentColor={kpi.color}
              sparkData={kpi.spark}
            />
          ))}
        </div>

        {/* Alerts */}
        <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm">
          <p className="text-sm font-bold text-navy mb-3">Alertes RH</p>
          <div className="flex flex-col gap-2">
            {[
              { msg: '4 agents en fin de CLM (&lt;30j)', color: colors.warning },
              { msg: 'Mise à jour CNRACL disponible', color: colors.primary },
              { msg: '2 CET dépassent 55 jours', color: colors.accent },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg" style={{ background: a.color + '12', border: `1px solid ${a.color}30` }}>
                <div className="w-1.5 h-1.5 rounded-full mt-1 shrink-0" style={{ background: a.color }} />
                <p className="text-[11px] text-navy leading-snug" dangerouslySetInnerHTML={{ __html: a.msg }} />
              </div>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
