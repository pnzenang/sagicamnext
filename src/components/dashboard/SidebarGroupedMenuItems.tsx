import { auth } from '@clerk/nextjs/server'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'
import type { MenuItem } from '@/utils/types'

const SidebarGroupedMenuItems = async ({ groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  return <SidebarGroupedMenuItemsClient groupLabel={groupLabel} isAdminUser={isAdminUser} />
}

export default SidebarGroupedMenuItems
