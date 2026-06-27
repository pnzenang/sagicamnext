import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  experimental: {
    serverActions: {
      bodySizeLimit: '25mb'
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: 'res.cloudinary.com',
        pathname: '/dp8tkb7hq/image/upload/**',
        protocol: 'https'
      }
    ]
  },
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']
}
