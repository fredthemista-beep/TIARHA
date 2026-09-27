import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'TIARH — TerritorialRH Suite',
  description: 'Simulateurs RH pour la Fonction Publique Territoriale',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
