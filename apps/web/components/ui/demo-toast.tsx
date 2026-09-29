'use client';
// apps/web/components/ui/demo-toast.tsx
// Toast minimal, sans dépendance : un événement window + un hôte monté dans le layout.

import { useEffect, useState } from 'react';

export const DEMO_MESSAGE = 'Disponible dans la version connectée — démo';
const EVENT = 'tiarha:toast';

export function showToast(message: string = DEMO_MESSAGE) {
  window.dispatchEvent(new CustomEvent<string>(EVENT, { detail: message }));
}

export function ToastHost() {
  const [toast, setToast] = useState<{ id: number; message: string } | null>(null);

  useEffect(() => {
    function onToast(e: Event) {
      setToast({ id: Date.now(), message: (e as CustomEvent<string>).detail });
    }
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);

  return (
    <div role="status" aria-live="polite" className="demo-toast-region">
      {toast && (
        <div key={toast.id} className="demo-toast">
          <span aria-hidden="true">ℹ️</span>
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );
}

type DemoButtonProps = Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onClick' | 'type'> & {
  message?: string;
};

/** Bouton d'une action qui nécessite la base de données : affiche le toast de démo. */
export function DemoButton({ message, children, ...rest }: DemoButtonProps) {
  return (
    <button type="button" {...rest} onClick={() => showToast(message)}>
      {children}
    </button>
  );
}
