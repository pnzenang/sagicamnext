import { auth } from '@clerk/nextjs/server'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'
import type { MenuItem } from '@/utils/types'

const fetchPendingNameChangeRequestCount = async (isAdminUser: boolean) => {
  if (!isAdminUser) return 0

  try {
    const { default: db } = await import('@/utils/db')

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

const getNameChangeBadge = (pendingNameChangeRequestCount: number) => {
  if (pendingNameChangeRequestCount <= 0) return undefined

  return pendingNameChangeRequestCount > 99 ? '99+' : String(pendingNameChangeRequestCount)
}

const SidebarGroupedMenuItems = async ({ groupLabel }: { data: MenuItem[]; groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const pendingNameChangeRequestCount = await fetchPendingNameChangeRequestCount(isAdminUser)

  return (
    <SidebarGroupedMenuItemsClient
      groupLabel={groupLabel}
      isAdminUser={isAdminUser}
      nameChangeBadge={getNameChangeBadge(pendingNameChangeRequestCount)}
    />
  )
}

export default SidebarGroupedMenuItems
