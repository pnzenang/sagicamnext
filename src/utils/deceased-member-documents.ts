import { deceasedMemberDocumentTypes } from './types'

export type DeceasedMemberDocumentApprovalFields = {
  documentType: string
  status: string
}

export const hasAllApprovedDeceasedMemberDocuments = (documents: DeceasedMemberDocumentApprovalFields[]) =>
  deceasedMemberDocumentTypes.every(documentType =>
    documents.some(document => document.documentType === documentType && document.status === 'approved')
  )
