'use client';
import { useState } from 'react';
import { calculerHeures, CET_PLAFOND_JOURS } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { colors, PlanGate } from '@tiarh/ui';

export default function HeuresPage() {
  const [form, setForm] = useState({ indiceMajore: '400', heuresSup: '14', joursCETExistants: '10' });
  const [result, setResult] = useState<ReturnType<typeof calculerHeures> | null>(null);

  function calc() {
    setResult(calculerHeures({
      indiceMajore: Number(form.indiceMajore),
      heuresSup: Number(form.heuresSup),
      joursCETExistants: Number(form.joursCETExistants),
    }));
  }

  return (
    <>
      <Topbar title="HeuresSup+" subtitle={`IHTS + CET (plafond ${CET_PLAFOND_JOURS} jours)`} plan="starter" />
      <main className="flex-1 overflow-y-auto p-6">
        <PlanGate required={['starter', 'pro', 'enterprise']} currentPlan="starter">
          <div className="grid grid-cols-2 gap-6 max-w-4xl">
            <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
              <p className="text-sm font-bold text-navy">Paramètres</p>
              {[
                { key: 'indiceMajore', label: 'Indice majoré (IM)' },
                { key: 'heuresSup', label: 'Heures supplémentaires' },
                { key: 'joursCETExistants', label: 'Jours CET existants' },
              ].map(({ key, label }) => (
                <div key={key} className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">{label}</Label>
                  <Input
                    type="number"
                    value={form[key as keyof typeof form]}
                    onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                    className="text-sm"
                  />
                </div>
              ))}
              <Button onClick={calc} className="bg-midblue hover:bg-midblue/90 text-white">Calculer</Button>
            </div>

            {result && (
              <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
                <p className="text-sm font-bold text-navy">Résultat</p>
                {[
                  { label: 'IHTS par heure', value: `${result.ihtsParHeure.toFixed(4)} €`, color: colors.primary },
                  { label: 'IHTS total brut', value: `${result.ihtsTotal.toFixed(2)} €`, color: colors.primary },
                  { label: 'Coût employeur (+ CNRACL)', value: `${result.coutEmployeurTotal.toFixed(2)} €`, color: colors.accent },
                  { label: 'Jours CET crédités', value: `${result.joursCET} j`, color: colors.midBlue },
                  { label: 'Plafond CET atteint', value: result.cetPlafondAtteint ? 'Oui ⚠' : 'Non', color: result.cetPlafondAtteint ? colors.warning : colors.success },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                    <span className="text-xs text-muted">{label}</span>
                    <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
                  </div>
                ))}
                <p className="text-[10px] text-muted">Formule IHTS : IM × 4,92278 / 1820 · Source : Décret n°2002-60</p>
              </div>
            )}
          </div>
        </PlanGate>
      </main>
    </>
  );
}
