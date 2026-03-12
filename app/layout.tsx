import type { Metadata, Viewport } from 'next';
import './globals.css';
import { RegisterSW } from '@/components/pwa/register-sw';

export const metadata: Metadata = {
  title: 'SmartBudget',
  description: 'Control financiero personal',
  applicationName: 'SmartBudget',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SmartBudget'
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' }
    ],
    apple: [{ url: '/icons/icon-192.png' }]
  }
};

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
