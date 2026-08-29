import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GlobeSkill — Technology & AI Education for Every Child',
  description: 'GlobeSkill is an initiative to help underserved learners gain access to digital skills, technology education and AI-enabled career opportunities.',
  keywords: ['GlobeSkill', 'AI Education', 'Digital Skills', 'Technology for Kids', 'NGO', 'Non-profit Education'],
  authors: [{ name: 'GlobeSkill Initiative' }],
};

export const viewport: Viewport = {
  themeColor: '#1e3a8a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
