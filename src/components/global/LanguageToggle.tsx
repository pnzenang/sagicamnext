'use client'

import { Suspense, useMemo } from 'react'

import { usePathname, useSearchParams } from 'next/navigation'

import { languageCookieName, languageOptions, normalizeLanguage, type AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'

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

const LanguageToggleContent = ({ currentLanguage = 'en', nextPath }: LanguageToggleContentProps) => (
  <div
    className='ring-primary/60 bg-primary/10 text-primary relative grid h-10 w-[5.75rem] grid-cols-2 gap-1 rounded-md p-1 text-xs font-semibold shadow-[inset_0_-3px_6px_0px_rgba(255,255,255,100)] ring-2 backdrop-blur duration-500'
    aria-label='Choose site language'
  >
    <span
      aria-hidden='true'
      className='bg-primary absolute top-1 left-1 h-8 w-10 rounded-sm shadow-sm transition-transform duration-300 ease-out'
      style={{
        transform: currentLanguage === 'fr' ? 'translateX(2.75rem)' : 'translateX(0)'
      }}
    />
    {Object.entries(languageOptions).map(([language, option]) => {
      const typedLanguage = language as AppLanguage
      const isActive = typedLanguage === currentLanguage

      const className = cn(
        'relative z-10 flex h-8 w-10 items-center justify-center rounded-sm transition-colors duration-200',
        isActive ? 'text-primary-foreground' : 'hover:text-foreground'
      )

      if (!nextPath) {
        return (
          <span key={language} className={className}>
            {option.shortLabel}
          </span>
        )
      }

      return (
        <button
          key={language}
          type='button'
          aria-label={option.ariaLabel}
          aria-current={isActive ? 'page' : undefined}
          className={className}
          onClick={() => {
            setLanguageCookie(typedLanguage)

            const redirectPath = getLanguageRedirectPath(typedLanguage)
            const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`

            if (redirectPath === currentPath) {
              window.location.reload()

              return
            }

            window.location.assign(redirectPath)
          }}
        >
          {option.shortLabel}
        </button>
      )
    })}
  </div>
)

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
