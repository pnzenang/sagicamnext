import type { ReactNode } from 'react'

import { cookies } from 'next/headers'

import Header from '@/components/layout/header'
import Footer from '@/components/layout/footer'
import type { Navigation } from '@/components/layout/header-navigation'
import { languageCookieName, normalizeLanguage, publicText, translatePublicNavigationLabel } from '@/lib/i18n'

const navigationData: Navigation[] = [
  {
    title: 'Mission',
    href: '/#mission'
  },
  {
    title: 'Benefits',
    href: '/#benefits'
  },
  {
    title: 'Fees & Payments',
    href: '/#fees'
  },
  {
    title: 'FAQ',
    href: '/#faq'
  },
  {
    title: 'Contact',
    href: '/#contact'
  }
]

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)

  const translatedNavigationData = navigationData.map(item => ({
    ...item,
    title: translatePublicNavigationLabel(item.title, language)
  }))

  const copy = publicText[language]

  return (
    <div className='flex min-h-dvh flex-col bg-[repeating-linear-gradient(45deg,color-mix(in_oklab,var(--border)40%,transparent)0,color-mix(in_oklab,var(--border)40%,transparent)1px,transparent_0,transparent_50%)] bg-size-[12px_12px] bg-fixed'>
      <div className='mx-auto flex min-h-dvh w-full max-w-350 flex-col px-4 sm:px-6 lg:px-8' lang={language}>
        <div className='bg-background flex min-h-dvh w-full max-w-7xl flex-col border-x'>
          {/* Header Section */}
          <Header navigationData={translatedNavigationData} language={language} loginLabel={copy.login} />

          {/* Main Content */}
          <main className='flex flex-1 flex-col *:scroll-mt-20 sm:*:scroll-mt-24 lg:*:scroll-mt-28'>{children}</main>

          {/* Footer Section */}
          <Footer language={language} />
        </div>
      </div>
    </div>
  )
}

export default PagesLayout
