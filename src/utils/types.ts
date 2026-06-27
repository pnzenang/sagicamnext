import type { ComponentType } from 'react'

export type MenuSubItem = {
  icon?: ComponentType
  label: string
  href: string
  badge?: string
}

type BaseMenuItem = {
  badge?: string
  icon: ComponentType
  label: string
}

export type MenuItem =
  | (BaseMenuItem & {
      href: string
      children?: never
    })
  | (BaseMenuItem & {
      href?: never
      children: MenuSubItem[]
    })

export type actionFunction = (prevState: any, formData: FormData) => Promise<{ message: string }>

export enum delegateRecommendation {
  confirm = 'Confirm',
  transferFromSagi = 'Transfer_From_Sagi',
  transferOut = 'Transfer_Out',
  transferIn = 'Transfer_In'
}

export enum memberStatus {
  Pending = 'pending',
  Awaiting = 'awaiting_publication',
  Vested = 'vested',
  Delinquent = 'not_in_good_standing'
}

export type MemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfBirth: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  memberStatus: string
  sponsorCode: string
  currentContributionAmountOwed?: number
  currentContributionVestedCount?: number
  currentContributionAmountPerVestedMember?: number
  currentContributionTotalAmount?: number
  currentContributionAmountSent?: number
  createdAt: Date
  updatedAt: Date
}

export type RemovedMemberType = {
  id: string
  originalMemberId?: string | null
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfBirth: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string | null
  delegateRecommendation?: string | null
  memberStatus?: string | null
  sponsorCode: string
  reasonForLeaving: string
  originalMemberCreatedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export enum reasonForLeaving {
  NoReason = 'No Reason',
  Relocated = 'Moved out of USA',
  TooExpensive = 'Too Expensive',
  Passed = 'Dead during the Waiting Period'
}

export type DeceasedMemberType = {
  id: string
  originalMemberId?: string | null
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  contributionStatus: string
  registrationDate: string
  dateOfBirth?: string | null
  countryOfBirth: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  delegateRecommendation?: string | null
  memberStatus?: string | null
  sponsorCode: string
  dateOfDeath: string
  placeOfDeath: string
  originalMemberCreatedAt?: Date | null
  createdAt: Date
  updatedAt: Date
}

export enum contributionStatus {
  review = 'Received_And_In_Review',
  denied = 'Contribution_Denied',
  underway = 'Contribution_Underway',
  completed = 'Contribution_Completed'
}

export const deceasedMemberDocumentTypes = [
  'death_certificate',
  'deceased_id_card',
  'deceased_picture',
  'funeral_program'
] as const

export type DeceasedMemberDocumentType = (typeof deceasedMemberDocumentTypes)[number]

export const deceasedMemberDocumentLabels: Record<DeceasedMemberDocumentType, string> = {
  death_certificate: 'Death certificate',
  deceased_id_card: 'Deceased ID card',
  deceased_picture: 'Deceased picture',
  funeral_program: 'Funeral program'
}

export const deceasedMemberDocumentStatuses = ['submitted', 'approved', 'rejected'] as const

export type DeceasedMemberDocumentStatus = (typeof deceasedMemberDocumentStatuses)[number]

export const deceasedMemberDocumentStatusLabels: Record<DeceasedMemberDocumentStatus, string> = {
  approved: 'Approved',
  rejected: 'Rejected',
  submitted: 'Submitted'
}

export type DeceasedMemberDocument = {
  id: string
  deceasedMemberId: string
  clerkId: string
  cloudinaryDeliveryType?: string | null
  cloudinaryFormat?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryResourceType?: string | null
  cloudinaryVersion?: number | null
  sponsorCode: string
  documentType: string
  fileName: string
  mimeType: string
  fileSize: number
  secureUrl?: string | null
  status: string
  rejectionReason?: string | null
  createdAt: Date
  updatedAt: Date
}

export type DeceasedMemberWithDocuments = DeceasedMemberType & {
  documents: DeceasedMemberDocument[]
}

export const nameChangeRequestReasons = ['typo_or_error', 'legal_document'] as const

export type NameChangeRequestReason = (typeof nameChangeRequestReasons)[number]

export const nameChangeRequestReasonLabels: Record<NameChangeRequestReason, string> = {
  legal_document: 'Legal document',
  typo_or_error: 'Typo or correction'
}

export const nameChangeRequestStatuses = ['submitted', 'documentation_requested', 'approved', 'rejected'] as const

export type NameChangeRequestStatus = (typeof nameChangeRequestStatuses)[number]

export const nameChangeRequestStatusLabels: Record<NameChangeRequestStatus, string> = {
  approved: 'Approved',
  documentation_requested: 'Documentation requested',
  rejected: 'Rejected',
  submitted: 'Submitted'
}

export const memberTransferRequestStatuses = [
  'receiving_sponsor_pending',
  'receiving_sponsor_approved',
  'receiving_sponsor_rejected',
  'admin_approved',
  'admin_rejected',
  'cancelled'
] as const

export type MemberTransferRequestStatus = (typeof memberTransferRequestStatuses)[number]

export const memberTransferRequestStatusLabels: Record<MemberTransferRequestStatus, string> = {
  admin_approved: 'Admin approved',
  admin_rejected: 'Admin rejected',
  cancelled: 'Cancelled',
  receiving_sponsor_approved: 'Receiving sponsor approved',
  receiving_sponsor_pending: 'Receiving sponsor pending',
  receiving_sponsor_rejected: 'Receiving sponsor rejected'
}
