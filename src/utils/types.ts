import type { ComponentType } from 'react'

export type MenuSubItem = {
  label: string
  href: string
  badge?: string
}

export type MenuItem = {
  icon: ComponentType
  label: string
  href: string
}

export type actionFunction = (prevState: any, formData: FormData) => Promise<{ message: string }>

export enum delegateRecommendation {
  Confirm = 'confirm',
  Transfer = 'transfer'
}

export enum memberStatus {
  Pending = 'pending',
  Vested = 'vested'
}

export type MemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfBirth: string
  memberMatriculationNumber: string

  // delegateRecommendation: string
  // memberStatus: string
  nameOfBeneficiary?: string
  associationName: string
  associationCode: string
  createdAt: Date
  updatedAt: Date
}

export type RemovedMemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  dateOfBirth: string
  countryOfBirth: string
  memberMatriculationNumber: string
  associationName: string
  associationCode: string
  reasonForLeaving: string
  createdAt: Date
  updatedAt: Date
}

export enum reasonForLeaving {
  NoReason = 'No Reason',
  Relocated = 'Moved out of USA',
  TooExpensive = 'Too Expensive '
}

export type DeceasedMemberType = {
  id: string
  clerkId: string
  firstName: string
  lastAndMiddleNames: string

  contributionStatus: string
  registrationDate: string
  countryOfBirth: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  associationName: string
  associationCode: string
  dateOfDeath: string
  placeOfDeath: string
  createdAt: Date
  updatedAt: Date
}

export enum contributionStatus {
  review = 'Case_In_Review',
  denied = 'Contribution_Denied',
  underway = 'Contribution_Underway',
  completed = 'Contribution_Completed'
}
