import { auth } from '@clerk/nextjs/server'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'
import type { MenuItem } from '@/utils/types'
import db from '@/utils/db'

const getMenuItemWithNameChangeBadge = (item: MenuItem, pendingNameChangeRequestCount: number): MenuItem => {
  if (item.href === '/name-change-documents-upload' && pendingNameChangeRequestCount > 0) {
    return {
      ...item,
      badge: pendingNameChangeRequestCount > 99 ? '99+' : String(pendingNameChangeRequestCount)
    }
  }

  return item
}

const SidebarGroupedMenuItems = async ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const pendingNameChangeRequestCount = isAdminUser
    ? await db.nameChangeRequest.count({
        where: {
          status: 'submitted'
        }
      })
    : 0

  const menuItems = data.map(item => getMenuItemWithNameChangeBadge(item, pendingNameChangeRequestCount))

  return <SidebarGroupedMenuItemsClient data={menuItems} groupLabel={groupLabel} isAdminUser={isAdminUser} />
}

export default SidebarGroupedMenuItems
