import type { ReactNode } from 'react'

import { ClerkProvider } from '@clerk/nextjs'
import { Geist, Geist_Mono } from 'next/font/google'
import type { Metadata, Viewport } from 'next'

import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'

import { cn } from '@/lib/utils'

import './globals.css'
import { Toaster } from '@/components/ui/sonner'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  applicationName: 'SAGICAM',
  title: {
    template: 'SAGICAM by Active Solidarity ',
    default: 'SAGICAM by Active Solidarity'
  },
  description: 'Grow the solidarity ring as big as it can be, because together we are stronger.',
  manifest: '/manifest.webmanifest',
  robots: 'index,follow',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'SAGICAM'
  },
  formatDetection: {
    telephone: false
  },
  keywords: [
    'sales analytics',
    'solidarity growth',
    'togetherness dashboard',
    'business analytics',
    'growth tracking',
    'sales performance'
  ],
  icons: {
    icon: [
      {
        url: '/favicon/favicon-16x16.png',
        sizes: '16x16',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png'
      },
      {
        url: '/favicon/favicon.ico',
        sizes: '48x48',
        type: 'image/x-icon'
      }
    ],
    apple: [
      {
        url: '/favicon/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png'
      }
    ],
    other: [
      {
        url: '/favicon/android-chrome-192x192.png',
        rel: 'icon',
        sizes: '192x192',
        type: 'image/png'
      },
      {
        url: '/favicon/android-chrome-512x512.png',
        rel: 'icon',
        sizes: '512x512',
        type: 'image/png'
      }
    ]
  },
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`),
  openGraph: {
    title: {
      template: 'SAGICAM: Active Solidarity',
      default: 'SAGICAM: Active Solidarity'
    },
    description: 'Grow the solidarity ring as big as it can be, because together we are stronger..',
    type: 'website',
    siteName: 'Flow',
    url: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}`,
    images: [
      {
        url: '/images/og-image.png',
        type: 'image/png',
        width: 1200,
        height: 630,
        alt: 'Flow - SaaS Landing page'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: {
      template: 'Demo: %s - Flow | Shadcn Studio',
      default: 'Demo: Flow - SaaS Landing page | Shadcn Studio'
    },
    description: 'Grow the solidarity ring as big as it can be, because together we are stronger.'
  }
}

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: '#4f46e5',
  viewportFit: 'cover',
  width: 'device-width'
}

const RootLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <ClerkProvider
        signInUrl='/sign-in'
        signUpUrl='/sign-up'
        signInFallbackRedirectUrl='/profile/create'
        signUpFallbackRedirectUrl='/profile/create'
        afterSignOutUrl='/'
      >
        <html
          lang='en'
          className={cn(geistSans.variable, geistMono.variable, 'flex min-h-dvh w-full scroll-smooth antialiased')}
          suppressHydrationWarning
        >
          <body className='flex min-h-dvh w-full flex-auto flex-col'>
            <ThemeProvider attribute='class' enableSystem={false} disableTransitionOnChange>
              <TooltipProvider>
                <main>{children}</main>
                <Toaster />
              </TooltipProvider>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  )
}

export default RootLayout
