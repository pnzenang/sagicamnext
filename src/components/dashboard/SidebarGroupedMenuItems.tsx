import { auth } from '@clerk/nextjs/server'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'

type SidebarBadgeMap = Record<string, string | undefined>

const getNameChangeBadge = (requestCount: number) => {
  if (requestCount <= 0) return undefined

  return requestCount > 99 ? '99+' : String(requestCount)
}

const fetchNameChangeSidebarBadges = async ({
  isAdminUser,
  userId
}: {
  isAdminUser: boolean
  userId: string | null
}): Promise<SidebarBadgeMap> => {
  if (!userId) return {}

  try {
    const { default: db } = await import('@/utils/db')

    const [adminPendingReviewCount, sponsorRequiredActionCount] = await Promise.all([
      isAdminUser
        ? db.nameChangeRequest.count({
            where: {
              status: 'submitted'
            }
          })
        : Promise.resolve(0),
      !isAdminUser
        ? db.nameChangeRequest.count({
            where: {
              clerkId: userId,
              status: 'documentation_requested'
            }
          })
        : Promise.resolve(0)
    ])

    return {
      '/admin-name-changes': getNameChangeBadge(adminPendingReviewCount),
      '/name-change-documents-upload': getNameChangeBadge(sponsorRequiredActionCount)
    }
  } catch (error) {
    console.error('Unable to load name change sidebar badges', error)

    return {}
  }
}

const SidebarGroupedMenuItems = async ({ groupLabel }: { groupLabel?: string }) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID

  const menuBadges = await fetchNameChangeSidebarBadges({ isAdminUser, userId })

  return (
    <SidebarGroupedMenuItemsClient
      groupLabel={groupLabel}
      isAdminUser={isAdminUser}
      menuBadges={menuBadges}
    />
  )
}

export default SidebarGroupedMenuItems
