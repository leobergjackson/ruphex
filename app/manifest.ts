import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Recibo',
    short_name: 'Recibo',
    description: 'Multimodal AI with voice, files, and on-chain payments on Arbitrum',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#111827',
    theme_color: '#3b82f6',
    icons: [
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
    categories: ['finance', 'productivity', 'utilities'],
  };
}
