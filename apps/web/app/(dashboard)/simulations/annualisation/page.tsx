'use client';
import { useState } from 'react';
import {
  calculerBaseAnnuelle,
  calculerSoldeAnnuel,
  HEURES_ANNUELLES,
} from '@tiarh/engine';
import type { SaisieMensuelle, ResultatBaseAnnuelle, ResultatSoldeAnnuel } from '@tiarh/engine';
import { Topbar } from '@/components/dashboard/Topbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { colors, PlanGate } from '@tiarh/ui';

const MOIS_LABELS = ['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'] as const;

export default function AnnualisationPage() {
  const currentYear = new Date().getFullYear();

  const [form, setForm] = useState({
    quotite: '100',
    annee: String(currentYear),
    dateDebut: '',
    dateFin: '',
    heuresTotalesManuelle: '',
  });

  // moisSaisis : clé = numéro du mois (1–12), valeur = string de l'input
  const [moisInputs, setMoisInputs] = useState<Record<number, string>>({});

  const [base, setBase] = useState<ResultatBaseAnnuelle | null>(null);
  const [solde, setSolde] = useState<ResultatSoldeAnnuel | null>(null);

  function calculer() {
    const quotite = Math.min(1, Math.max(0.01, Number(form.quotite) / 100));
    const annee = Number(form.annee);

    const resultBase = calculerBaseAnnuelle({
      quotite,
      annee,
      dateDebut: form.dateDebut || undefined,
      dateFin:   form.dateFin   || undefined,
    });
    setBase(resultBase);

    const moisSaisis: SaisieMensuelle[] = Object.entries(moisInputs)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .flatMap(([k, v]) => {
        const mois = Number(k);
        if (mois < 1 || mois > 12) return [];
        return [{ mois: mois as SaisieMensuelle['mois'], heures: Number(v) }];
      });

    const resultSolde = calculerSoldeAnnuel({
      heuresDues: resultBase.heuresDues,
      moisSaisis,
      heuresTotalesManuelle: form.heuresTotalesManuelle !== ''
        ? Number(form.heuresTotalesManuelle)
        : undefined,
    });
    setSolde(resultSolde);
  }

  // Recalcul réactif quand un mois change (base doit déjà être calculée)
  function onMoisChange(mois: number, valeur: string) {
    const next = { ...moisInputs, [mois]: valeur };
    setMoisInputs(next);

    if (!base) return;
    const moisSaisis: SaisieMensuelle[] = Object.entries(next)
      .filter(([, v]) => v !== '' && !isNaN(Number(v)))
      .flatMap(([k, v]) => {
        const mois = Number(k);
        if (mois < 1 || mois > 12) return [];
        return [{ mois: mois as SaisieMensuelle['mois'], heures: Number(v) }];
      });
    setSolde(calculerSoldeAnnuel({
      heuresDues: base.heuresDues,
      moisSaisis,
      heuresTotalesManuelle: form.heuresTotalesManuelle !== ''
        ? Number(form.heuresTotalesManuelle)
        : undefined,
    }));
  }

  const alerteCouleur = (depasse: boolean, valeurEstimee: number | null) => {
    if (valeurEstimee === null) return { bg: '#f1f5f9', dot: colors.textMuted, text: '#64748b' };
    if (depasse)               return { bg: '#fef3c7', dot: colors.warning,    text: '#92400e' };
    return                            { bg: '#dcfce7', dot: colors.success,    text: '#166534' };
  };

  return (
    <>
      <Topbar
        title="AnnualisationRH"
        subtitle={`Annualisation du temps de travail — base ${HEURES_ANNUELLES} h (FPT)`}
        plan="starter"
      />
      <main className="flex-1 overflow-y-auto p-6">
        <PlanGate required={['starter', 'pro', 'enterprise']} currentPlan="starter">
          <div className="max-w-4xl flex flex-col gap-6">

            {/* ── Formulaire paramètres ── */}
            <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
              <p className="text-sm font-bold text-navy mb-4">Paramètres agent</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Quotité (%)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={100}
                    value={form.quotite}
                    onChange={e => setForm(p => ({ ...p, quotite: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Année de référence</Label>
                  <Input
                    type="number"
                    value={form.annee}
                    onChange={e => setForm(p => ({ ...p, annee: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Date arrivée (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.dateDebut}
                    onChange={e => setForm(p => ({ ...p, dateDebut: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <Label className="text-xs font-medium text-navy">Date départ (optionnel)</Label>
                  <Input
                    type="date"
                    value={form.dateFin}
                    onChange={e => setForm(p => ({ ...p, dateFin: e.target.value }))}
                    className="text-sm"
                  />
                </div>
                <div className="flex flex-col gap-1 col-span-2">
                  <Label className="text-xs font-medium text-navy">
                    Total heures réalisées — saisie globale (optionnel, remplacé par le suivi mensuel)
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.heuresTotalesManuelle}
                    onChange={e => setForm(p => ({ ...p, heuresTotalesManuelle: e.target.value }))}
                    className="text-sm"
                    placeholder="ex : 1 740"
                  />
                </div>
              </div>
              <Button onClick={calculer} className="bg-midblue hover:bg-midblue/90 text-white">
                Calculer
              </Button>
            </div>

            {/* ── Onglets résultats ── */}
            {base && solde && (
              <Tabs defaultValue="calcul">
                <TabsList className="mb-4">
                  <TabsTrigger value="calcul">Calcul annuel</TabsTrigger>
                  <TabsTrigger value="mensuel">Suivi mensuel</TabsTrigger>
                  <TabsTrigger value="alertes">Alertes légales</TabsTrigger>
                </TabsList>

                {/* ── Onglet 1 : Calcul annuel ── */}
                <TabsContent value="calcul">
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* KPI Base */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Base annuelle due</p>
                        <p className="text-2xl font-bold text-navy font-mono">
                          {base.heuresDues.toFixed(1)} h
                        </p>
                        <p className="text-[10px] text-muted mt-1">
                          {HEURES_ANNUELLES} h × {form.quotite} %
                          {base.estProratise && ` × prorata ${base.joursPresence}/${base.joursAnnee} j`}
                        </p>
                      </div>
                      {/* KPI Réalisées */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Heures réalisées</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: colors.primary }}>
                          {solde.heuresRealisees.toFixed(1)} h
                        </p>
                        <p className="text-[10px] text-muted mt-1">
                          {solde.moisSaisisCount > 0
                            ? `${solde.moisSaisisCount} mois saisis`
                            : 'saisie globale'}
                        </p>
                      </div>
                      {/* KPI Solde */}
                      {solde.heuresSup > 0 ? (
                        <div className="bg-amber-50 rounded-xl p-5 border border-amber-200 shadow-sm text-center">
                          <p className="text-[10px] text-amber-700 uppercase tracking-wider mb-1">Heures sup. fin d&apos;année</p>
                          <p className="text-2xl font-bold font-mono" style={{ color: colors.warning }}>
                            +{solde.heuresSup.toFixed(1)} h
                          </p>
                          <p className="text-[10px] text-amber-600 mt-1">régularisation due</p>
                        </div>
                      ) : (
                        <div className="bg-red-50 rounded-xl p-5 border border-red-200 shadow-sm text-center">
                          <p className="text-[10px] text-red-600 uppercase tracking-wider mb-1">Déficit à rattraper</p>
                          <p className="text-2xl font-bold font-mono" style={{ color: colors.danger }}>
                            -{solde.heuresDeficit.toFixed(1)} h
                          </p>
                          <p className="text-[10px] text-red-400 mt-1">heures non effectuées</p>
                        </div>
                      )}
                      {/* KPI Progression */}
                      <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm text-center">
                        <p className="text-[10px] text-muted uppercase tracking-wider mb-1">Progression</p>
                        <p className="text-2xl font-bold font-mono" style={{ color: colors.success }}>
                          {(solde.progression * 100).toFixed(1)} %
                        </p>
                        <p className="text-[10px] text-muted mt-1">de la base annuelle</p>
                      </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="bg-white rounded-xl p-5 border border-black/5 shadow-sm">
                      <p className="text-xs font-bold text-navy mb-3">Avancement annuel</p>
                      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(100, solde.progression * 100)}%`,
                            background: solde.progression > 1
                              ? colors.warning
                              : solde.progression >= 0.9
                              ? colors.success
                              : colors.primary,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-muted mt-1.5">
                        <span>0 h</span>
                        {solde.progression > 1 && (
                          <span style={{ color: colors.warning }} className="font-semibold">
                            Seuil {base.heuresDues.toFixed(0)} h dépassé
                          </span>
                        )}
                        <span>{base.heuresDues.toFixed(0)} h dues</span>
                      </div>
                      <p className="text-[10px] text-muted mt-3 pt-3 border-t border-black/5">
                        Source : Décret n°2000-815 du 25 août 2000 · Base {HEURES_ANNUELLES} h = 228 j × 7 h + journée solidarité
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* ── Onglet 2 : Suivi mensuel ── */}
                <TabsContent value="mensuel">
                  <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
                    <p className="text-sm font-bold text-navy mb-1">Suivi mensuel</p>
                    <p className="text-[11px] text-muted mb-4">
                      Saisir les heures réalisées par mois. Prend le pas sur la saisie globale.
                    </p>
                    <div className="grid grid-cols-4 gap-3">
                      {MOIS_LABELS.map((label, i) => {
                        const mois = i + 1;
                        const val = moisInputs[mois] ?? '';
                        const rensigne = val !== '' && !isNaN(Number(val));
                        return (
                          <div
                            key={mois}
                            className="rounded-lg p-3 flex flex-col gap-1.5 transition-colors"
                            style={{ background: rensigne ? '#dbeafe' : '#f1f5f9' }}
                          >
                            <span className="text-[10px] font-bold" style={{ color: rensigne ? '#1e40af' : '#94a3b8' }}>
                              {label}
                            </span>
                            <Input
                              type="number"
                              min={0}
                              value={val}
                              onChange={e => onMoisChange(mois, e.target.value)}
                              placeholder="— h"
                              className="text-xs h-7 px-2 border-0 bg-transparent font-mono font-bold"
                              style={{ color: rensigne ? '#1e40af' : '#94a3b8' }}
                            />
                          </div>
                        );
                      })}
                    </div>
                    {solde.moisSaisisCount > 0 && (
                      <div className="mt-4 pt-4 border-t border-black/5">
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${(solde.moisSaisisCount / 12) * 100}%`,
                              background: colors.primary,
                            }}
                          />
                        </div>
                        <p className="text-[10px] text-muted mt-1">
                          {solde.moisSaisisCount} mois sur 12 renseignés
                        </p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ── Onglet 3 : Alertes légales ── */}
                <TabsContent value="alertes">
                  <div className="bg-white rounded-xl p-6 border border-black/5 shadow-sm">
                    <p className="text-sm font-bold text-navy mb-1">Alertes légales</p>
                    <p className="text-[11px] text-muted mb-4">
                      Estimations basées sur les heures saisies. CGFP art. D1332-22 · Décret n°2000-815.
                    </p>
                    <div className="flex flex-col gap-3">
                      {solde.alertesLegales.map(alerte => {
                        const { bg, dot, text } = alerteCouleur(alerte.depasse, alerte.valeurEstimee);
                        return (
                          <div
                            key={alerte.type}
                            className="flex items-start gap-3 rounded-lg px-4 py-3"
                            style={{ background: bg }}
                          >
                            <div
                              className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                              style={{ background: dot }}
                            />
                            <div>
                              <p className="text-xs font-semibold" style={{ color: text }}>
                                {alerte.type === 'SEMAINE_MAX' && 'Durée hebdomadaire max — 48 h/semaine'}
                                {alerte.type === 'SEMAINE_MOYENNE_MAX' && 'Moyenne hebdomadaire — 44 h sur 12 semaines'}
                                {alerte.type === 'JOUR_MAX' && 'Durée journalière max — 10 h/jour'}
                              </p>
                              <p className="text-[11px] mt-0.5" style={{ color: text, opacity: 0.8 }}>
                                {alerte.message}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </PlanGate>
      </main>
    </>
  );
}
