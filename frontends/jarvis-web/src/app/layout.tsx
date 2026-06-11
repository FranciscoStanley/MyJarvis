import type { Metadata, Viewport } from 'next';
import { PROJECT_AUTHOR } from '@myjarvis/shared';
import './globals.css';

export const metadata: Metadata = {
  title: 'MyJarvis — Assistente Inteligente',
  description: 'Seu assistente pessoal de IA inspirado no JARVIS',
  authors: [{ name: PROJECT_AUTHOR }],
  creator: PROJECT_AUTHOR,
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'MyJarvis' },
};

export const viewport: Viewport = {
  themeColor: '#0a0e17',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen overflow-x-hidden">{children}</body>
    </html>
  );
}
