import * as z from 'zod'
import type { ZodSchema } from 'zod'

import prisma from './db'
import { contributionStatus, delegateRecommendation, memberStatus, reasonForLeaving } from './types'

export const profileSchema = z.object({
  sponsorCode: z
    .string()
    .toUpperCase()
    .length(4, { message: 'Sponsor code must be exactly 4 characters' })
    .regex(/^[a-zA-Z]+$/, { message: 'Sponsor code must contain only letters' }),
  sponsorFirstName: z.string().toUpperCase(),
  sponsorLastAndMiddleName: z
    .string()
    .toUpperCase()
    .min(2, { message: 'Sponsor last and middle name must be at least 2 characters' }),
  sponsorPhoneNumber: z.string().length(14, { message: 'First Delegate Phone number must be exactly 14 characters' }),
  sponsorEmail: z.email('Please enter a valid email address')
})

export const memberSchema = z.object({
  firstName: z.string().toUpperCase(),
  sponsorCode: z.string().toUpperCase(),
  lastAndMiddleNames: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member last name should be at least 2 characters' }),
  dateOfBirth: z.string().length(10, { message: 'The date of birth is not valid date, please enter a valid date' }),
  countryOfBirth: z.string().toUpperCase().min(2, { message: 'the member las name should be at least 2 characters' }),
  nameOfBeneficiary: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member las name should be at least 2 characters' }),
  delegateRecommendation: z.enum(delegateRecommendation),
  memberStatus: z.enum(memberStatus)
})
export const RemovedMemberSchema = z.object({
  firstName: z.string().toUpperCase(),
  sponsorCode: z.string().toUpperCase(),
  lastAndMiddleNames: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member last name should be at least 2 characters' }),
  dateOfBirth: z.string().length(10, { message: 'Date of birth should be 10 characters' }),
  countryOfBirth: z.string().toUpperCase().min(2, { message: 'the member las name should be at least 2 characters' }),
  memberMatriculationNumber: z.string(),

  // nameOfBeneficiary: z
  //   .string()
  //   .toUpperCase()
  //   .min(2, { message: 'the member las name should be at least 2 characters' }),
  // delegateRecommendation: z.enum(delegateRecommendation),
  // memberStatus: z.enum(memberStatus),
  reasonForLeaving: z.enum(reasonForLeaving)
})
export const DeceasedMemberSchema = z.object({
  firstName: z.string().toUpperCase(),
  sponsorCode: z.string().toUpperCase(),
  lastAndMiddleNames: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member last name should be at least 2 characters' }),

  // dateOfBirth: z.string().length(10, { message: 'Date of birth should be 10 characters' }),
  registrationDate: z.string(),
  dateOfDeath: z.string().length(10, { message: 'Date of death should be 10 characters' }),
  countryOfBirth: z.string().toUpperCase().min(2, { message: 'the member las name should be at least 2 characters' }),
  memberMatriculationNumber: z.string(),
  placeOfDeath: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member place of death should be at least 2 characters' }),
  nameOfBeneficiary: z
    .string()
    .toUpperCase()
    .min(2, { message: 'the member las name should be at least 2 characters' }),
  contributionStatus: z.enum(contributionStatus)

  // delegateRecommendation: z.enum(delegateRecommendation),
  // memberStatus: z.enum(memberStatus)
})

export function validateWithZodSchema<T>(schema: ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)

  if (!result.success) {
    const errors = result.error.issues.map(error => error.message)

    throw new Error(errors.join(','))
  }

  return result.data
}
