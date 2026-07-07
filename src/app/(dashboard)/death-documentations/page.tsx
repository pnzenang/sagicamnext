import { fetchSponsorDeathDocumentationCasesAction } from '@/utils/actions'

import DeathDocumentationCases from './DeathDocumentationCases'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SponsorDeathDocumentationsPage = async () => {
  const { deceasedMembers } = await fetchSponsorDeathDocumentationCasesAction()

  return (
    <DeathDocumentationCases
      canManageUploads
      canReviewDocuments={false}
      deceasedMembers={deceasedMembers}
      description='Upload the four required documents for each deceased loved one.'
      emptyDescription='Death documentation will appear here after you submit a death announcement.'
      emptyTitle='No death announcements found.'
      title='Death Documentations'
    />
  )
}

export default SponsorDeathDocumentationsPage
