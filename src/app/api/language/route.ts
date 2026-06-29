import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { languageCookieName, normalizeLanguage } from '@/lib/i18n'

const getSafeNextPath = (value: string | null) => {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return '/'

  return value
}

export const GET = (request: NextRequest) => {
  const language = normalizeLanguage(request.nextUrl.searchParams.get('lang'))
  const nextPath = getSafeNextPath(request.nextUrl.searchParams.get('next'))
  const redirectUrl = new URL(nextPath, request.url)

  if (redirectUrl.pathname === '/') {
    if (language === 'fr') {
      redirectUrl.searchParams.set('lang', language)
    } else {
      redirectUrl.searchParams.delete('lang')
    }
  } else {
    redirectUrl.searchParams.delete('lang')
  }

  const response = NextResponse.redirect(redirectUrl)

  response.cookies.set(languageCookieName, language, {
    httpOnly: false,
    maxAge: 60 * 60 * 24 * 365,
    path: '/',
    sameSite: 'lax'
  })

  return response
}
