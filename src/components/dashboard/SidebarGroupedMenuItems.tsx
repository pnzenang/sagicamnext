import Link from 'next/link'
import { ChevronRightIcon } from 'lucide-react'

import { auth } from '@clerk/nextjs/server'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem
} from '../ui/sidebar'
import type { MenuItem } from '@/utils/types'

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

            if (item.children) {
              return (
                <Collapsible key={item.label} asChild className='group/collapsible'>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        className='data-[state=open]:text-primary focus:bg-primary my-1 py-1 transition-all duration-500 hover:ml-5 focus:text-neutral-50'
                      >
                        <item.icon />
                        <span className='truncate capitalize'>{item.label}</span>
                        <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map(child => (
                          <SidebarMenuSubItem key={child.label}>
                            <SidebarMenuSubButton
                              asChild
                              className='my-1 transition-all duration-500 hover:ml-2 focus:bg-primary focus:text-neutral-50'
                            >
                              <Link href={child.href}>
                                {child.icon && <child.icon />}
                                <span className='truncate capitalize'>{child.label}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

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
