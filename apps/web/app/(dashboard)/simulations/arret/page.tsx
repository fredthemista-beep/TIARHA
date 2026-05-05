'use client';
import { useState } from 'react';
import { calculerArret } from '@tiarh/engine';
import type { TypeConge } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { colors } from '@tiarh/ui';

type FormState = {
  indiceMajore: string;
  traitementBrut: string;
  primesMenusuelles: string;
  type: TypeConge;
  dureeJours: string;
};

const TYPE_LABELS: Record<TypeConge, string> = {
  CMO: 'CMO — Congé Maladie Ordinaire',
  CLM: 'CLM — Congé Longue Maladie',
  CLD: 'CLD — Congé Longue Durée',
  AT: 'AT — Accident de Travail',
  CITIS: 'CITIS — Accident imputable au service',
};

export default function SimulArretPage() {
  const [form, setForm] = useState<FormState>({
    indiceMajore: '400',
    traitementBrut: '2000',
    primesMenusuelles: '300',
    type: 'CMO',
    dureeJours: '90',
  });
  const [result, setResult] = useState<ReturnType<typeof calculerArret> | null>(null);

  function handleChange(key: keyof FormState, value: string) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleCalculate() {
    const r = calculerArret({
      agent: {
        indiceMajore: Number(form.indiceMajore),
        traitementBrut: Number(form.traitementBrut),
        primesMenusuelles: Number(form.primesMenusuelles),
      },
      type: form.type,
      dureeJours: Number(form.dureeJours),
    });
    setResult(r);
  }

  return (
    <>
      <Topbar title="SimulArrêt" subtitle="Coût arrêts maladie — CMO / CLM / CLD / CITIS" plan="free" />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-2 gap-6 max-w-4xl">

          {/* Form */}
          <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
            <p className="text-sm font-bold text-navy">Paramètres de l&apos;agent</p>

            {[
              { key: 'indiceMajore', label: 'Indice majoré (IM)', placeholder: '400' },
              { key: 'traitementBrut', label: 'Traitement brut mensuel (€)', placeholder: '2000' },
              { key: 'primesMenusuelles', label: 'Primes mensuelles (€)', placeholder: '300' },
              { key: 'dureeJours', label: "Durée de l'arrêt (jours)", placeholder: '90' },
            ].map(({ key, label, placeholder }) => (
              <div key={key} className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-navy">{label}</Label>
                <Input
                  type="number"
                  placeholder={placeholder}
                  value={form[key as keyof FormState]}
                  onChange={e => handleChange(key as keyof FormState, e.target.value)}
                  className="text-sm"
                />
              </div>
            ))}

            <div className="flex flex-col gap-1">
              <Label className="text-xs font-medium text-navy">Type de congé</Label>
              <select
                value={form.type}
                onChange={e => handleChange('type', e.target.value as TypeConge)}
                className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              >
                {(Object.keys(TYPE_LABELS) as TypeConge[]).map(t => (
                  <option key={t} value={t}>{TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            <Button onClick={handleCalculate} className="bg-accent hover:bg-accent/90 text-white mt-2">
              Calculer le coût
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm flex flex-col gap-4">
              <p className="text-sm font-bold text-navy">Résultat</p>
              {[
                { label: 'Maintien de traitement', value: `${result.maintienTraitement.toFixed(2)} €`, color: colors.primary },
                { label: 'Charges CNRACL employeur', value: `${result.coutCNRACL.toFixed(2)} €`, color: colors.midBlue },
                { label: 'Coût total employeur', value: `${result.coutEmployeur.toFixed(2)} €`, color: colors.accent },
                { label: 'Durée', value: `${result.dureeJours} jours`, color: colors.textMuted },
                { label: 'Taux de maintien final', value: `${(result.tauxMaintien * 100).toFixed(0)} %`, color: colors.success },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex justify-between items-center py-2 border-b border-black/5 last:border-0">
                  <span className="text-xs text-muted">{label}</span>
                  <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted mt-2">Moteur v1.0.0 · Source : CGFP + taux CNRACL 30.65%</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
