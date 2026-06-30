import { fetchAdminDeathDocumentationCasesAction } from '@/utils/actions'

import DeathDocumentationCases from '../death-documentations/DeathDocumentationCases'

const AdminDeathDocumentationsPage = async () => {
  const { deceasedMembers } = await fetchAdminDeathDocumentationCasesAction()

  return (
    <DeathDocumentationCases
      canManageUploads={false}
      canReviewDocuments
      deceasedMembers={deceasedMembers}
      description='Review submitted death documents, download files, and approve or reject each document.'
      emptyDescription='Submitted death documents will appear here after sponsors upload them.'
      emptyTitle='No death documentation cases found.'
      title='Admin Death Documentations'
    />
  )
}

export default AdminDeathDocumentationsPage
