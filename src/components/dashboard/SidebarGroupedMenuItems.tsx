import { auth } from '@clerk/nextjs/server'

import { dashboardText, type AppLanguage } from '@/lib/i18n'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'

type SidebarBadgeMap = Record<string, string | undefined>

const getSidebarBadge = (requestCount: number) => {
  if (requestCount <= 0) return undefined

  return requestCount > 99 ? '99+' : String(requestCount)
}

const fetchSidebarBadges = async ({
  isAdminUser,
  userId
}: {
  isAdminUser: boolean
  userId: string | null
}): Promise<SidebarBadgeMap> => {
  if (!userId) return {}

  try {
    const { default: db } = await import('@/utils/db')

    let adminPendingNameChangeCount = 0
    let adminPendingTransferCount = 0
    let sponsorRequiredNameChangeCount = 0
    let sponsorPendingTransferCount = 0

    if (isAdminUser) {
      adminPendingNameChangeCount = await db.nameChangeRequest.count({
        where: {
          status: 'submitted'
        }
      })

      adminPendingTransferCount = await db.memberTransferRequest.count({
        where: {
          status: 'receiving_sponsor_approved'
        }
      })
    } else {
      sponsorRequiredNameChangeCount = await db.nameChangeRequest.count({
        where: {
          clerkId: userId,
          status: 'documentation_requested'
        }
      })

      sponsorPendingTransferCount = await db.memberTransferRequest.count({
        where: {
          initiatingClerkId: userId,
          status: 'receiving_sponsor_pending'
        }
      })
    }

    return {
      '/admin-member-transfers': getSidebarBadge(adminPendingTransferCount),
      '/admin-name-changes': getSidebarBadge(adminPendingNameChangeCount),
      '/member-transfer': getSidebarBadge(sponsorPendingTransferCount),
      '/name-change-documents-upload': getSidebarBadge(sponsorRequiredNameChangeCount)
    }
  } catch (error) {
    console.warn('Unable to load sidebar badges', error)

    return {}
  }
}

const SidebarGroupedMenuItems = async ({
  groupLabel,
  language = 'en'
}: {
  groupLabel?: string
  language?: AppLanguage
}) => {
  const { userId } = await auth()
  const isAdminUser = userId === process.env.ADMIN_USER_ID
  const copy = dashboardText[language]

  const menuBadges = await fetchSidebarBadges({ isAdminUser, userId })

  return (
    <SidebarGroupedMenuItemsClient
      adminLabel={copy.sidebar.admin}
      groupLabel={groupLabel}
      isAdminUser={isAdminUser}
      language={language}
      menuBadges={menuBadges}
    />
  )
}

export default SidebarGroupedMenuItems
