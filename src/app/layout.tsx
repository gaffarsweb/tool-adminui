import type { Metadata, Viewport } from 'next';
import { brand } from '@/config/brand';
import { geist, inter } from '@/styles/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: `${brand.name} · ${brand.tagline}`,
    template: `%s · ${brand.name} Admin`,
  },
  description: `Administrative console for the ${brand.name} platform.`,
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: '#0c0e16',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${geist.variable} ${inter.variable}`}>
      <body className="bg-surface font-body-md text-on-surface antialiased">{children}</body>
    </html>
  );
}
