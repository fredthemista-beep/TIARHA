// apps/web/lib/prefill.ts
// Lecture des paramètres de pré-remplissage des simulateurs (liens depuis une fiche agent).

type Params = { get(name: string): string | null };

/** Nombre borné lu dans l'URL, ou null s'il est absent ou invalide. */
export function readNumber(params: Params, key: string, min: number, max: number): number | null {
  const raw = params.get(key);
  if (raw === null || raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) && n >= min && n <= max ? n : null;
}

/** Valeur lue dans l'URL si elle appartient à la liste autorisée. */
export function readEnum<T extends string>(params: Params, key: string, allowed: readonly T[]): T | null {
  const raw = params.get(key);
  return raw !== null && (allowed as readonly string[]).includes(raw) ? (raw as T) : null;
}

/** Ajoute la valeur du dossier aux options d'un select si elle n'y figure pas. */
export function withOption(options: { value: number; label: string }[], value: number, label: string) {
  if (options.some(o => o.value === value)) return options;
  return [...options, { value, label }].sort((a, b) => a.value - b.value);
}
