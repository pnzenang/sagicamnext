'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRightIcon } from 'lucide-react'

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
import { pagesItems } from '@/utils/links'

const activeMenuButtonClassName =
  'data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:hover:bg-primary data-[active=true]:hover:text-primary-foreground data-[active=true]:focus:bg-primary data-[active=true]:focus:text-primary-foreground'

const transparentDropdownButtonClassName =
  'bg-transparent hover:bg-transparent active:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent data-[state=open]:text-primary data-[state=open]:hover:bg-transparent data-[state=open]:hover:text-primary data-[active=true]:bg-transparent data-[active=true]:text-primary data-[active=true]:hover:bg-transparent data-[active=true]:hover:text-primary data-[active=true]:focus:bg-transparent data-[active=true]:focus:text-primary'

const isHrefActive = (pathname: string, href: string) => pathname === href || pathname.startsWith(`${href}/`)

const SidebarGroupedMenuItemsClient = ({
  groupLabel,
  isAdminUser
}: {
  groupLabel?: string
  isAdminUser: boolean
}) => {
  const pathname = usePathname()

  return (
    <SidebarGroup className='pt-16'>
      {groupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent>
        <SidebarMenu>
          {pagesItems.map(item => {
            if (item.label.includes('Admin') && !isAdminUser) return null

            if (item.children) {
              const hasActiveChild = item.children.some(child => isHrefActive(pathname, child.href))

              return (
                <Collapsible key={item.label} asChild defaultOpen={hasActiveChild} className='group/collapsible'>
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.label}
                        isActive={hasActiveChild}
                        className={`my-1 py-1 transition-all duration-500 hover:ml-5 ${transparentDropdownButtonClassName}`}
                      >
                        <item.icon />
                        <span className='truncate capitalize'>{item.label}</span>
                        <ChevronRightIcon className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.children.map(child => {
                          const isActive = isHrefActive(pathname, child.href)

                          return (
                            <SidebarMenuSubItem key={child.label}>
                              <SidebarMenuSubButton
                                asChild
                                isActive={isActive}
                                className={`my-1 transition-all duration-500 hover:ml-2 focus:bg-primary focus:text-neutral-50 ${activeMenuButtonClassName}`}
                              >
                                <Link href={child.href}>
                                  {child.icon && <child.icon />}
                                  <span className='truncate capitalize'>{child.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          )
                        })}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              )
            }

            const isActive = isHrefActive(pathname, item.href)

            return (
              <SidebarMenuItem key={item.label}>
                <SidebarMenuButton
                  tooltip={item.label}
                  asChild
                  isActive={isActive}
                  className={`data-[state=open]:text-primary focus:bg-primary my-1 py-1 transition-all duration-500 hover:ml-5 focus:text-neutral-50 ${activeMenuButtonClassName}`}
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

export default SidebarGroupedMenuItemsClient
