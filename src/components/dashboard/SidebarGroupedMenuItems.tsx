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

const fetchPendingNameChangeRequestCount = async (isAdminUser: boolean) => {
  if (!isAdminUser) return 0

  try {
    return await db.nameChangeRequest.count({
      where: {
        status: 'submitted'
      }
    })
  } catch (error) {
    console.error('Unable to load pending name change request count', error)

    return 0
  }
}

const SidebarGroupedMenuItems = async ({ data, groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const pendingNameChangeRequestCount = await fetchPendingNameChangeRequestCount(isAdminUser)

  const menuItems = data.map(item => getMenuItemWithNameChangeBadge(item, pendingNameChangeRequestCount))

  return <SidebarGroupedMenuItemsClient data={menuItems} groupLabel={groupLabel} isAdminUser={isAdminUser} />
}

export default SidebarGroupedMenuItems
