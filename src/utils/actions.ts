'use server'

import { error } from 'console'

import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath } from 'next/cache'
import { customAlphabet } from 'nanoid'

import { id } from 'date-fns/locale'

import db from './db'
import {
  DeceasedMemberSchema,
  memberSchema,
  profileSchema,
  RemovedMemberSchema,
  validateWithZodSchema
} from './schemas'
import { memberStatus } from './types'
import {
  sendDeathAnnouncementConfirmationEmail,
  sendLovedOneConfirmationEmail,
  sendLovedOneRemovalConfirmationEmail
} from './email'
import { Prisma } from '@/generated/prisma/client'
import prisma from './db'

const randomMatriculation = customAlphabet('1234567890', 6)

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const registrationDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const formatRegistrationDate = (date: Date) => registrationDateFormatter.format(date)

const fetchSponsorByCode = async (sponsorCode: string) => {
  const sponsor = await db.profile.findUnique({
    where: {
      sponsorCode
    }
  })

  if (!sponsor) throw new Error('Sponsor profile not found')

  return sponsor
}

const getAuthUser = async () => {
  const { userId } = await auth()

  if (!userId) {
    throw new Error('You must be login to access this route')
  }

  const profile = await db.profile.findUnique({
    where: {
      clerkId: userId
    },
    select: {
      id: true
    }
  })

  if (!profile) redirect('/profile/create')

  return { id: userId }
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const getRequiredFormValue = (formData: FormData, fieldName: string) => {
  const value = String(formData.get(fieldName) ?? '').trim()

  if (!value) {
    throw new Error(`${fieldName} is required.`)
  }

  return value
}

const getDollarAmountFromForm = (formData: FormData, fieldName: string) => {
  const rawAmount = String(formData.get(fieldName) ?? '')
    .replace(/[$,]/g, '')
    .trim()
  const amount = Number(rawAmount)

  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Enter a valid dollar amount.')
  }

  return amount
}

const fetchLatestContributionAssessment = async () => {
  return db.contributionAssessment.findFirst({
    include: {
      groups: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

const fetchContributionPaymentsByCode = async (sponsorCodes: string[]) => {
  if (sponsorCodes.length === 0) {
    return new Map<string, number>()
  }

  const payments = await db.sponsorContributionPayment.findMany({
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  return new Map(payments.map(payment => [payment.sponsorCode, decimalToNumber(payment.amountSent)]))
}

const attachContributionAmounts = async <T extends { sponsorCode: string }>(members: T[]) => {
  const latestAssessment = await fetchLatestContributionAssessment()
  const sponsorCodes = Array.from(new Set(members.map(member => member.sponsorCode)))
  const paymentsByCode = await fetchContributionPaymentsByCode(sponsorCodes)

  if (!latestAssessment) {
    return members.map(member => ({
      ...member,
      currentContributionAmountSent: paymentsByCode.get(member.sponsorCode) ?? 0
    }))
  }

  const groupsByCode = new Map(latestAssessment.groups.map(group => [group.sponsorCode, group]))
  const currentContributionAmountPerVestedMember = decimalToNumber(latestAssessment.amountPerVestedMember)
  const currentContributionTotalAmount = decimalToNumber(latestAssessment.totalAmount)

  return members.map(member => {
    const contributionGroup = groupsByCode.get(member.sponsorCode)

    return {
      ...member,
      currentContributionAmountOwed: contributionGroup ? decimalToNumber(contributionGroup.amountOwed) : 0,
      currentContributionAmountPerVestedMember,
      currentContributionTotalAmount,
      currentContributionAmountSent: paymentsByCode.get(member.sponsorCode) ?? 0,
      currentContributionVestedCount: contributionGroup?.vestedMembersCount ?? 0
    }
  })
}

export const createProfileAction = async (prevState: any, formData: FormData) => {
  try {
    const { userId } = await auth()

    if (!userId) throw new Error('Please login to create a profile')

    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.create({
      data: {
        clerkId: userId,
        ...validatedFields
      }
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return { message: 'The association Code you picked is already taken, choose a different code' }
      }
    }

    return renderError(error)
  }

  redirect('/navigation-instructions')
}

export const fetchProfile = async () => {
  const user = await getAuthUser()

  const profile = await db.profile.findUnique({
    where: {
      clerkId: user.id
    }
  })

  if (!profile) redirect('/profile/create')

  return profile
}

export const updateProfileAction = async (prevState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)

    const validatedFields = validateWithZodSchema(profileSchema, rawData)

    await db.profile.update({
      where: {
        clerkId: user.id
      },
      data: validatedFields
    })
    revalidatePath('/profile')

    return { message: 'Profile updated successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const createMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)
    const memberMatriculationNumber = `SC${validatedFields.sponsorCode}${randomMatriculation()}`

    await db.member.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberMatriculationNumber
      }
    })

    await sendLovedOneConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: validatedFields.firstName,
      lovedOneLastAndMiddleNames: validatedFields.lastAndMiddleNames,
      dateOfBirth: validatedFields.dateOfBirth,
      sponsorCode: validatedFields.sponsorCode,
      memberMatriculationNumber
    })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first names, last names date of birth and recommendation already exists, please check your entries or contact admin for assistance.'
        }
      }
    }

    return renderError(error)
  }

  redirect('/all-members')
}

export const fetchMembers = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return attachContributionAmounts(members)
}

export const fetchCurrentSponsorContribution = async () => {
  const profile = await fetchProfile()
  const latestAssessment = await fetchLatestContributionAssessment()
  const contributionGroup = latestAssessment?.groups.find(group => group.sponsorCode === profile.sponsorCode)
  const amountPerVestedMember = decimalToNumber(latestAssessment?.amountPerVestedMember)
  const vestedMembersCount = contributionGroup?.vestedMembersCount ?? 0

  const payment = await db.sponsorContributionPayment.findUnique({
    where: {
      sponsorCode: profile.sponsorCode
    }
  })

  const totalAssessedContribution = await db.contributionAssessmentGroup.aggregate({
    _sum: {
      amountOwed: true
    },
    where: {
      sponsorCode: profile.sponsorCode
    }
  })

  const amountOwed = Number((amountPerVestedMember * vestedMembersCount).toFixed(2))
  const amountReceived = decimalToNumber(payment?.amountSent)
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const totalAmountOwed = decimalToNumber(totalAssessedContribution._sum.amountOwed)

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    balance: Number((amountVerified - totalAmountOwed).toFixed(2)),
    sponsorCode: profile.sponsorCode,
    totalAmountOwed,
    vestedMembersCount
  }
}

export const fetchCurrentSponsorRegistrationPayment = async () => {
  const profile = await fetchProfile()

  const payment = await db.sponsorRegistrationPayment.findUnique({
    where: {
      sponsorCode: profile.sponsorCode
    }
  })

  return {
    amountReceived: decimalToNumber(payment?.amountSent),
    amountVerified: decimalToNumber(payment?.amountVerified),
    sponsorCode: profile.sponsorCode
  }
}

export const fetchMembersForAdmin = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    // where: {},
    orderBy: { createdAt: 'desc' }
  })

  return attachContributionAmounts(members)
}

export const createContributionAssessmentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAuthUser()

  try {
    const rawAmount = String(formData.get('totalAmount') ?? '')
      .replace(/[$,]/g, '')
      .trim()

    const totalAmount = Number(rawAmount)

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      throw new Error('Enter a valid dollar amount greater than 0.')
    }

    const vestedMembers = await db.member.findMany({
      select: {
        sponsorCode: true
      },
      where: {
        memberStatus: memberStatus.Vested
      }
    })

    if (vestedMembers.length === 0) {
      throw new Error('No vested loved ones were found.')
    }

    const vestedMembersByCode = vestedMembers.reduce((counts, member) => {
      counts.set(member.sponsorCode, (counts.get(member.sponsorCode) ?? 0) + 1)

      return counts
    }, new Map<string, number>())

    const amountPerVestedMember = Number((totalAmount / vestedMembers.length).toFixed(2))

    await db.contributionAssessment.create({
      data: {
        amountPerVestedMember,
        totalAmount,
        totalVestedMembers: vestedMembers.length,
        groups: {
          create: Array.from(vestedMembersByCode.entries()).map(([sponsorCode, vestedMembersCount]) => ({
            amountOwed: Number((amountPerVestedMember * vestedMembersCount).toFixed(2)),
            sponsorCode,
            vestedMembersCount
          }))
        }
      }
    })

    revalidatePath('/admin-members')
    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')

    return {
      message: `Distributed ${currencyFormatter.format(totalAmount)} across ${vestedMembers.length} vested loved ones. Each vested loved one is ${currencyFormatter.format(amountPerVestedMember)}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const saveSponsorContributionPaymentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const profile = await db.profile.findUnique({
      where: {
        clerkId: user.id
      },
      select: {
        sponsorCode: true
      }
    })

    if (!profile) {
      throw new Error('Sponsor profile not found.')
    }

    const amountSent = getDollarAmountFromForm(formData, 'amountSent')

    const payment = await db.sponsorContributionPayment.upsert({
      create: {
        amountSent,
        sponsorCode: profile.sponsorCode
      },
      update: {
        amountSent: {
          increment: amountSent
        }
      },
      where: {
        sponsorCode: profile.sponsorCode
      }
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')

    return {
      message: `Added amount sent: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const verifySponsorContributionPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const payment = await db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    if (!payment) {
      throw new Error('No contribution payment found for this sponsor code.')
    }

    const amountSent = decimalToNumber(payment.amountSent)

    await db.sponsorContributionPayment.update({
      data: {
        amountVerified: amountSent,
        verifiedAt: new Date()
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const setSponsorContributionPaidAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const contributionAmountOwed = getDollarAmountFromForm(formData, 'contributionAmountOwed')

    await db.sponsorContributionPayment.upsert({
      create: {
        amountSent: contributionAmountOwed,
        amountVerified: contributionAmountOwed,
        sponsorCode,
        verifiedAt: new Date()
      },
      update: {
        amountVerified: contributionAmountOwed,
        verifiedAt: new Date()
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const resetSponsorContributionPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const payment = await db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    if (!payment) {
      return
    }

    await db.sponsorContributionPayment.update({
      data: {
        amountSent: payment.amountVerified
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const saveSponsorRegistrationPaymentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const profile = await db.profile.findUnique({
      where: {
        clerkId: user.id
      },
      select: {
        sponsorCode: true
      }
    })

    if (!profile) {
      throw new Error('Sponsor profile not found.')
    }

    const amountSent = getDollarAmountFromForm(formData, 'registrationAmountSent')

    const payment = await db.sponsorRegistrationPayment.upsert({
      create: {
        amountSent,
        sponsorCode: profile.sponsorCode
      },
      update: {
        amountSent: {
          increment: amountSent
        }
      },
      where: {
        sponsorCode: profile.sponsorCode
      }
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')

    return {
      message: `Added registration amount sent: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const verifySponsorRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const payment = await db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    if (!payment) {
      throw new Error('No registration payment found for this sponsor code.')
    }

    const amountSent = decimalToNumber(payment.amountSent)

    await db.sponsorRegistrationPayment.update({
      data: {
        amountVerified: amountSent,
        verifiedAt: new Date()
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const setSponsorRegistrationPaidAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const registrationAmountOwed = getDollarAmountFromForm(formData, 'registrationAmountOwed')

    await db.sponsorRegistrationPayment.upsert({
      create: {
        amountSent: registrationAmountOwed,
        amountVerified: registrationAmountOwed,
        sponsorCode,
        verifiedAt: new Date()
      },
      update: {
        amountVerified: registrationAmountOwed,
        verifiedAt: new Date()
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const resetSponsorRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    await db.sponsorRegistrationPayment.upsert({
      create: {
        amountSent: 0,
        amountVerified: 0,
        sponsorCode,
        verifiedAt: null
      },
      update: {
        amountSent: 0,
        amountVerified: 0,
        verifiedAt: null
      },
      where: {
        sponsorCode
      }
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const resetContributionCalculationAction = async (): Promise<{ message: string }> => {
  await getAuthUser()

  try {
    const latestAssessment = await fetchLatestContributionAssessment()

    if (!latestAssessment) {
      return { message: 'No contribution calculation found to reset.' }
    }

    await db.contributionAssessment.delete({
      where: {
        id: latestAssessment.id
      }
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-members')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')

    return { message: 'Latest contribution calculation reset successfully.' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchSingleMemberDetails = async (memberId: string) => {
  const user = await getAuthUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId,
      clerkId: user.id
    }
  })

  if (!member) redirect('/all-members')

  return member
}

export const fetchSingleMemberDetailsForAdmin = async (memberId: string) => {
  await getAuthUser()

  const member = await db.member.findUnique({
    where: {
      id: memberId

      // clerkId: user?.id
    }
  })

  if (!member) redirect('/admin-members')

  return member
}

export const updateMemberDetailsAction = async (prevState: any, formData: FormData) => {
  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`all-members/${memberId}/edit`)

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const updateMemberDetailsActionForAdmin = async (prevState: any, formData: FormData) => {
  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(memberSchema, rawData)

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin-members/${memberId}/edit`)

    // return { message: `Member Details Updated Successfully` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return {
          message:
            'A member with the same first names, last names date of birth and recommendation already exists, please check your entries or contact admin for assistance.'
        }
      }
    }

    return renderError(error)
  }

  redirect('/admin-members')
}

export const createRemovedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)
    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    await sendLovedOneRemovalConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: validatedFields.firstName,
      lovedOneLastAndMiddleNames: validatedFields.lastAndMiddleNames,
      dateOfBirth: validatedFields.dateOfBirth,
      sponsorCode: validatedFields.sponsorCode,
      memberMatriculationNumber: validatedFields.memberMatriculationNumber,
      reasonForLeaving: validatedFields.reasonForLeaving
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const createRemovedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)
    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    await sendLovedOneRemovalConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: validatedFields.firstName,
      lovedOneLastAndMiddleNames: validatedFields.lastAndMiddleNames,
      dateOfBirth: validatedFields.dateOfBirth,
      sponsorCode: validatedFields.sponsorCode,
      memberMatriculationNumber: validatedFields.memberMatriculationNumber,
      reasonForLeaving: validatedFields.reasonForLeaving
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-members')
}

export const fetchRemovedMembersAction = async () => {
  const user = await getAuthUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const fetchRemovedMembersActionAdmin = async () => {
  const user = await getAuthUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const createDeceasedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId,
        clerkId: user.id
      }
    })

    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    if (!member) {
      throw new Error('Loved one not found.')
    }

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        registrationDate: formatRegistrationDate(member.createdAt),
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    await sendDeathAnnouncementConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: validatedFields.firstName,
      lovedOneLastAndMiddleNames: validatedFields.lastAndMiddleNames,
      dateOfDeath: validatedFields.dateOfDeath,
      placeOfDeath: validatedFields.placeOfDeath,
      sponsorCode: validatedFields.sponsorCode,
      memberMatriculationNumber: validatedFields.memberMatriculationNumber,
      contributionStatus: validatedFields.contributionStatus
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const createDeceasedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    if (!member) {
      throw new Error('Loved one not found.')
    }

    await db.deceasedMember.create({
      data: {
        ...validatedFields,
        registrationDate: formatRegistrationDate(member.createdAt),
        clerkId: user.id
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    await sendDeathAnnouncementConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: validatedFields.firstName,
      lovedOneLastAndMiddleNames: validatedFields.lastAndMiddleNames,
      dateOfDeath: validatedFields.dateOfDeath,
      placeOfDeath: validatedFields.placeOfDeath,
      sponsorCode: validatedFields.sponsorCode,
      memberMatriculationNumber: validatedFields.memberMatriculationNumber,
      contributionStatus: validatedFields.contributionStatus
    })
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-members')
}

export const fetchDeceasedMembersAction = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

export const fetchDeceasedMembersActionAdmin = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

export const deleteRemovedMemberAction = async (prevState: { removedMemberId: string }) => {
  const { removedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.removedMember.delete({
      where: {
        id: removedMemberId
      }
    })
    revalidatePath('/removed-members')

    return { message: 'deleted member removed ' }
  } catch (error) {}

  return renderError(error)
}

export const deleteDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const { deceasedMemberId } = prevState

  // await getAuthUser()

  try {
    await db.deceasedMember.delete({
      where: {
        id: deceasedMemberId
      }
    })
    revalidatePath('/deceased-members')

    return { message: 'deceased member removed ' }
  } catch (error) {}

  return renderError(error)
}

export const fetchSingleDeceasedMemberDetails = async (deceasedMemberId: string) => {
  await getAuthUser()

  const deceasedMember = await db.deceasedMember.findUnique({
    where: {
      id: deceasedMemberId

      // clerkId: user?.id
    }
  })

  if (!deceasedMember) redirect('/deceased-members')

  return deceasedMember
}

export const updateDeceasedMemberDetailsActionAdmin = async (prevState: any, formData: FormData) => {
  try {
    const deceasedMemberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    await db.deceasedMember.update({
      where: {
        id: deceasedMemberId
      },
      data: {
        ...validatedFields
      }
    })
    revalidatePath(`admin-deceased/${deceasedMemberId}/edit`)

    // return { message: `case status Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-deceased')
}
