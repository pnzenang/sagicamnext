import Link from 'next/link'

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '../ui/sidebar'
import type { MenuItem } from '@/utils/types'
import { auth } from '@clerk/nextjs/server'

const SidebarGroupedMenuItems = async ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID
  return (
    <SidebarGroup className='pt-16'>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {data.map(item => {
            if (item.label.includes('Admin') && !isAdminUser) return null
            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  asChild
                  className='data-[state=open]:text-primary focus:bg-primary my-1 py-1 transition-all duration-500 hover:ml-5 focus:text-neutral-50'
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className='truncate capitalize'>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

export default SidebarGroupedMenuItems
