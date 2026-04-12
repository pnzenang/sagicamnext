import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  basePath: process.env.BASEPATH ?? '',
  reactStrictMode: true,
  pageExtensions: ['js', 'jsx', 'ts', 'tsx']

  // images: {
  //   remotePatterns: [new URL('https://res.cloudinary.com/dp8tkb7hq/image/upload/v1752146281/sagicam_ukmjrr.png')]
  // }
}
