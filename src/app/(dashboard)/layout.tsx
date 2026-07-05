import type { ReactNode } from 'react'

import { UserButton } from '@clerk/nextjs'

import Link from 'next/link'
import { cookies } from 'next/headers'

import SidebarGroupedMenuItems from '@/components/dashboard/SidebarGroupedMenuItems'
import { ModeToggleSmall } from '@/components/layout/mode-toggle/mode-toggle-small'
import LogoSmall from '@/components/logoSmall'
import { Card, CardContent } from '@/components/ui/card'
import {
  SidebarProvider,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarTrigger,
  Sidebar
} from '@/components/ui/sidebar'
import { dashboardText, languageCookieName, normalizeLanguage } from '@/lib/i18n'
import { fetchProfile } from '@/utils/actions'

export const dynamic = 'force-dynamic'

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const [cookieStore, profile] = await Promise.all([cookies(), fetchProfile()])
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)
  const copy = dashboardText[language]
  const sponsorName = `${profile.sponsorFirstName} ${profile.sponsorLastAndMiddleName}`.trim()
  const sponsorLabel = `${profile.sponsorCode} - ${sponsorName || 'Sponsor'}`

  return (
    <>
      <div
        data-dashboard-shell
        className='bg-muted h-dvh w-full overflow-hidden print:block print:h-auto print:overflow-visible print:bg-white'
        lang={language}
      >
        <SidebarProvider className='h-full min-h-0 overflow-hidden'>
          <Sidebar collapsible='icon' className='**:data-[slot=sidebar-inner]:bg-muted border-r-0!'>
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton size='lg' className='gap-2.5 bg-transparent [&>svg]:size-8' asChild>
                    <Link href='/' className='flex justify-center'>
                      <LogoSmall className='size-24' />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroupedMenuItems language={language} />
            </SidebarContent>
          </Sidebar>
          <div className='flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden'>
            <header
              data-dashboard-header
              className='bg-muted z-50 flex shrink-0 items-center justify-between gap-4 px-3 py-3 sm:gap-6 sm:px-6 sm:py-4 print:hidden'
            >
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:size-5!' />
                <LogoSmall className='size-10 sm:hidden' />
              </div>
              <div className='text-primary flex min-w-0 flex-1 flex-col items-center text-center'>
                <div className='max-w-full truncate text-base font-bold leading-tight sm:text-2xl'>{copy.brand}</div>
                <div className='text-primary/80 max-w-full truncate text-xs leading-tight font-semibold sm:text-sm'>
                  {sponsorLabel}
                </div>
              </div>
              <div className='flex shrink-0 items-center justify-end gap-3'>
                <ModeToggleSmall />
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: 'size-8',
                      userButtonTrigger: 'flex items-center justify-center'
                    }
                  }}
                />
              </div>
            </header>
            <main
              data-dashboard-main
              className='min-h-0 min-w-0 flex-1 overflow-hidden px-2 pb-2 sm:px-6 sm:pb-6 print:block print:overflow-visible print:p-0'
            >
              <Card
                data-dashboard-frame
                className='h-full min-h-0 min-w-0 overflow-hidden py-0 print:h-auto print:overflow-visible print:rounded-none print:border-0 print:shadow-none'
              >
                <CardContent className='h-full min-h-0 min-w-0 overflow-hidden px-0 print:h-auto print:overflow-visible print:p-0'>
                  <main className='flex h-full min-h-0 min-w-0 flex-col overflow-y-auto overflow-x-hidden px-2 py-2 sm:px-6 sm:py-6 print:h-auto print:overflow-visible print:p-0 *:scroll-mt-20'>
                    {children}
                  </main>
                </CardContent>
              </Card>
            </main>
          </div>
        </SidebarProvider>
      </div>
    </>
  )
}

export default PagesLayout
