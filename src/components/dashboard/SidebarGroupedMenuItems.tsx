import { auth } from '@clerk/nextjs/server'

import { dashboardText, type AppLanguage } from '@/lib/i18n'
import { deceasedMemberDocumentTypes } from '@/utils/types'

import SidebarGroupedMenuItemsClient from './SidebarGroupedMenuItemsClient'

type SidebarBadgeMap = Record<string, string | undefined>
type DeathDocumentationBadgeCase = {
  documents: {
    documentType: string
    status: string
  }[]
}

const getSidebarBadge = (requestCount: number) => {
  if (requestCount <= 0) return undefined

  return requestCount > 99 ? '99+' : String(requestCount)
}

const getSponsorDeathDocumentationActionCount = (deceasedMembers: DeathDocumentationBadgeCase[]) =>
  deceasedMembers.reduce((total, deceasedMember) => {
    const documentStatusByType = new Map(
      deceasedMember.documents.map(document => [document.documentType, document.status])
    )

    const actionRequiredCount = deceasedMemberDocumentTypes.filter(documentType => {
      const status = documentStatusByType.get(documentType)

      return !status || status === 'rejected'
    }).length

    return total + actionRequiredCount
  }, 0)

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
    let adminPendingDeathDocumentCount = 0
    let adminPendingTransferCount = 0
    let sponsorRequiredDeathDocumentCount = 0
    let sponsorRequiredNameChangeCount = 0
    let sponsorPendingTransferCount = 0

    if (isAdminUser) {
      const [pendingNameChanges, pendingDeathDocuments, pendingTransfers] = await Promise.all([
        db.nameChangeRequest.count({
          where: {
            status: 'submitted'
          }
        }),
        db.deceasedMemberDocument.count({
          where: {
            status: 'submitted'
          }
        }),
        db.memberTransferRequest.count({
          where: {
            status: 'receiving_sponsor_approved'
          }
        })
      ])

      adminPendingNameChangeCount = pendingNameChanges
      adminPendingDeathDocumentCount = pendingDeathDocuments
      adminPendingTransferCount = pendingTransfers
    } else {
      const [sponsorRequiredNameChanges, sponsorPendingTransfers, sponsorDeathDocumentationCases] =
        await Promise.all([
          db.nameChangeRequest.count({
            where: {
              clerkId: userId,
              status: 'documentation_requested'
            }
          }),
          db.memberTransferRequest.count({
            where: {
              initiatingClerkId: userId,
              status: 'receiving_sponsor_pending'
            }
          }),
          db.deceasedMember.findMany({
            select: {
              documents: {
                select: {
                  documentType: true,
                  status: true
                }
              }
            },
            where: {
              clerkId: userId
            }
          })
        ])

      sponsorRequiredNameChangeCount = sponsorRequiredNameChanges
      sponsorPendingTransferCount = sponsorPendingTransfers
      sponsorRequiredDeathDocumentCount = getSponsorDeathDocumentationActionCount(sponsorDeathDocumentationCases)
    }

    return {
      '/admin-death-documentations': getSidebarBadge(adminPendingDeathDocumentCount),
      '/admin-member-transfers': getSidebarBadge(adminPendingTransferCount),
      '/admin-name-changes': getSidebarBadge(adminPendingNameChangeCount),
      '/death-documentations': getSidebarBadge(sponsorRequiredDeathDocumentCount),
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
