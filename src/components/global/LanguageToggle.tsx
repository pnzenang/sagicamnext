'use client'

import { Suspense, useMemo } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { PrimaryFlowButton } from '@/components/ui/flow-button'
import { languageCookieName, languageOptions, normalizeLanguage, type AppLanguage } from '@/lib/i18n'

type LanguageToggleContentProps = {
  currentLanguage?: AppLanguage
  nextPath?: string
}

const setLanguageCookie = (language: AppLanguage) => {
  document.cookie = `${languageCookieName}=${language}; Max-Age=31536000; Path=/; SameSite=Lax`
}

const getLanguageRedirectPath = (language: AppLanguage) => {
  const url = new URL(window.location.href)

  if (url.pathname === '/') {
    if (language === 'fr') {
      url.searchParams.set('lang', language)
    } else {
      url.searchParams.delete('lang')
    }
  } else {
    url.searchParams.delete('lang')
  }

  return `${url.pathname}${url.search}${url.hash}`
}

const LanguageToggleContent = ({ currentLanguage = 'en', nextPath }: LanguageToggleContentProps) => {
  const targetLanguage: AppLanguage = currentLanguage === 'fr' ? 'en' : 'fr'
  const targetOption = languageOptions[targetLanguage]

  return (
    <PrimaryFlowButton
      type='button'
      size='icon-lg'
      aria-label={targetOption.ariaLabel}
      className='bg-accent relative'
      disabled={!nextPath}
      onClick={() => {
        setLanguageCookie(targetLanguage)

        const redirectPath = getLanguageRedirectPath(targetLanguage)
        const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`

        if (redirectPath === currentPath) {
          window.location.reload()

          return
        }

        window.location.assign(redirectPath)
      }}
    >
      <span className='text-xs font-bold'>{targetOption.shortLabel}</span>
    </PrimaryFlowButton>
  )
}

const LanguageToggleInner = ({ homeOnly, initialLanguage }: { homeOnly?: boolean; initialLanguage: AppLanguage }) => {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const queryLanguage = searchParams.get('lang')
  const currentLanguage = normalizeLanguage(queryLanguage ?? initialLanguage)
  const search = searchParams.toString()
  const nextPath = useMemo(() => `${pathname}${search ? `?${search}` : ''}`, [pathname, search])

  if (homeOnly && pathname !== '/') return null

  return <LanguageToggleContent currentLanguage={currentLanguage} nextPath={nextPath} />
}

const LanguageToggle = ({
  homeOnly,
  initialLanguage = 'en'
}: {
  homeOnly?: boolean
  initialLanguage?: AppLanguage
}) => (
  <Suspense fallback={<LanguageToggleContent currentLanguage={initialLanguage} />}>
    <LanguageToggleInner homeOnly={homeOnly} initialLanguage={initialLanguage} />
  </Suspense>
)

export { LanguageToggle }
