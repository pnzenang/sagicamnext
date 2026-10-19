import { fetchAdminDeathDocumentationCasesAction } from '@/utils/actions'

import DeathDocumentationCases from '../death-documentations/DeathDocumentationCases'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const AdminDeathDocumentationsPage = async () => {
  const { deceasedMembers } = await fetchAdminDeathDocumentationCasesAction()

  return (
    <DeathDocumentationCases
      canManageUploads
      canReviewDocuments
      deceasedMembers={deceasedMembers}
      description='Upload, review, and download death documents, and approve or reject each document.'
      emptyDescription='Death documentation cases will appear here after a death announcement is submitted.'
      emptyTitle='No death documentation cases found.'
      title='Admin Death Documentations'
    />
  )
}

export default AdminDeathDocumentationsPage
