import type { ReactNode } from 'react'

import { UserButton } from '@clerk/nextjs'

import Link from 'next/link'

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
import { pagesItems } from '@/utils/links'

const PagesLayout = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <>
      <div className='bg-muted flex min-h-dvh w-full'>
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
              <SidebarGroupedMenuItems data={pagesItems} />
            </SidebarContent>
          </Sidebar>
          <div className='flex flex-1 flex-col'>
            <header className='bg-muted sticky top-0 z-50 flex items-center justify-between gap-6 px-4 py-4 sm:px-6'>
              <div className='flex items-center gap-4'>
                <SidebarTrigger className='[&_svg]:size-5!' />
                <LogoSmall className='size-10 sm:hidden' />
              </div>
              <h1 className='font-bold'>SAGICAM</h1>
              <div className='mx=auto flex justify-center gap-x-3'>
                <ModeToggleSmall />
                <UserButton />
              </div>
            </header>
            <main className='size-full flex-1 px-4 py-6 sm:px-6'>
              <Card className='h-full'>
                <CardContent className='h-full'>
                  <main className='flex flex-1 flex-col *:scroll-mt-20'>{children}</main>
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
