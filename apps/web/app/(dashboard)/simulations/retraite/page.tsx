'use client';
import { useState } from 'react';
import { calculerRetraite, POINT_INDICE, TRIMESTRES_RETRAITE_1965 } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { colors } from '@tiarh/ui';

export default function RetireSimPage() {
  const [form, setForm] = useState({
    indiceMajore: '500',
    trimestresValides: '172',
    anneeNaissance: '1965',
    anneeDepart: '2029',
  });
  const [result, setResult] = useState<ReturnType<typeof calculerRetraite> | null>(null);

  function calc() {
    setResult(calculerRetraite({
      indiceMajore: Number(form.indiceMajore),
      trimestresValides: Number(form.trimestresValides),
      anneeNaissance: Number(form.anneeNaissance),
      anneeDepart: Number(form.anneeDepart),
    }));
  }

  return (
    <>
      <Topbar title="RetireSim" subtitle="Pension CNRACL — Réforme 2023 (172 trimestres)" plan="pro" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-6 max-w-4xl">
          <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
            <p className="text-sm font-bold text-navy">Paramètres agent</p>
            {[
              { key: 'indiceMajore', label: 'Indice majoré (IM)' },
              { key: 'trimestresValides', label: 'Trimestres validés' },
              { key: 'anneeNaissance', label: 'Année de naissance' },
              { key: 'anneeDepart', label: 'Année de départ prévue' },
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
            <div className="text-[11px] text-muted bg-gray-50 rounded-lg p-3">
              <p>Point d&apos;indice : <strong className="text-navy font-mono">{POINT_INDICE} €</strong></p>
              <p>Trimestres taux plein (1965+) : <strong className="text-navy">{TRIMESTRES_RETRAITE_1965}</strong></p>
            </div>
            <Button onClick={calc} className="bg-primary hover:bg-primary/90 text-white">Calculer la pension</Button>
          </div>

          {result && (
            <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
              <p className="text-sm font-bold text-navy">Résultat</p>
              {[
                { label: 'Pension brute mensuelle', value: `${result.pensionBrute.toFixed(2)} €`, color: colors.primary },
                { label: 'Taux de liquidation', value: `${(result.tauxLiquidation * 100).toFixed(2)} %`, color: result.decote > 0 ? colors.accent : colors.success },
                { label: 'Décote appliquée', value: result.decote > 0 ? `−${(result.decote * 100).toFixed(2)} %` : 'Aucune', color: result.decote > 0 ? colors.danger : colors.success },
                { label: 'Surcote', value: result.surcote > 0 ? `+${(result.surcote * 100).toFixed(2)} %` : 'Aucune', color: result.surcote > 0 ? colors.success : colors.textMuted },
                { label: 'Trimestres requis (taux plein)', value: `${result.trimestresRequisTauxPlein}`, color: colors.textMuted },
                { label: 'Trimestres validés', value: `${result.trimestresValides}`, color: colors.navy },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted mt-2">Moteur v1.0.0 · Source : CNRACL + Loi n°2023-270</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
