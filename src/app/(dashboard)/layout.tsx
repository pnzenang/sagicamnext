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

export const dynamic = 'force-dynamic'

const PagesLayout = async ({ children }: Readonly<{ children: ReactNode }>) => {
  const cookieStore = await cookies()
  const language = normalizeLanguage(cookieStore.get(languageCookieName)?.value)
  const copy = dashboardText[language]

  return (
    <>
      <div className='bg-muted flex min-h-dvh w-full' lang={language}>
        <SidebarProvider>
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
          <div className='flex min-w-0 flex-1 flex-col'>
            <header className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-6 px-3 py-3 sm:px-6 sm:py-4'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:size-5!' />
                <LogoSmall className='size-10 sm:hidden' />
              </div>
              <div className='text-primary font-bold sm:text-2xl'>{copy.brand}</div>
              <div className='mx=auto flex justify-center gap-x-3'>
                <ModeToggleSmall />
                <UserButton />
              </div>
            </header>
            <main className='size-full min-w-0 flex-1 px-2 py-2 sm:px-6 sm:py-6'>
              <Card className='h-full min-w-0 overflow-hidden py-2 sm:py-6'>
                <CardContent className='h-full min-w-0 px-2 sm:px-6'>
                  <main className='flex min-w-0 flex-1 flex-col *:scroll-mt-20'>{children}</main>
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
