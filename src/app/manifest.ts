import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => ({
  name: 'SAGICAM by Active Solidarity',
  short_name: 'SAGICAM',
  description: 'Grow the solidarity ring as big as it can be, because together we are stronger.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#f4f4f8',
  theme_color: '#4f46e5',
  orientation: 'portrait',
  icons: [
    {
      src: '/favicon/android-chrome-192x192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable'
    },
    {
      src: '/favicon/android-chrome-512x512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable'
    }
  ]
})

export default manifest
