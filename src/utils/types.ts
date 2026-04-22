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
  confirm = 'Confirm',
  transferFromSagi = 'Transfer_From_Sagi',
  transferOut = 'Transfer_Out',
  transferIn = 'Transfer_In'
}

export enum memberStatus {
  Pending = 'pending',
  Vested = 'vested',
  Delinquent = 'delinquent'
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
  sponsorCode: string
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
  sponsorCode: string
  reasonForLeaving: string
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
  clerkId: string
  firstName: string
  lastAndMiddleNames: string
  contributionStatus: string
  registrationDate: string
  countryOfBirth: string
  memberMatriculationNumber: string
  nameOfBeneficiary?: string
  sponsorCode: string
  dateOfDeath: string
  placeOfDeath: string
  createdAt: Date
  updatedAt: Date
}

export enum contributionStatus {
  review = 'Received_And_In_Review',
  denied = 'Contribution_Denied',
  underway = 'Contribution_Underway',
  completed = 'Contribution_Completed'
}
