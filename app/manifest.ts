import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'SmartBudget',
    short_name: 'SmartBudget',
    description: 'Controla ingresos, gastos, presupuestos, suscripciones y objetivos desde tu teléfono.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone'],
    background_color: '#0f172a',
    theme_color: '#0f172a',
    orientation: 'portrait',
    lang: 'es-ES',
    categories: ['finance', 'productivity'],
    prefer_related_applications: false,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ],
    shortcuts: [
      {
        name: 'Resumen',
        short_name: 'Resumen',
        url: '/dashboard',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
      },
      {
        name: 'Movimientos',
        short_name: 'Movimientos',
        url: '/dashboard/transactions',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }]
      }
    ]
  };
}