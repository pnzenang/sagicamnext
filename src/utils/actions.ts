'use server'

import { randomUUID } from 'crypto'

import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
import { customAlphabet } from 'nanoid'

import db from './db'
import {
  DeceasedMemberSchema,
  memberSchema,
  profileSchema,
  RemovedMemberSchema,
  validateWithZodSchema
} from './schemas'
import {
  contributionStatus,
  deceasedMemberDocumentLabels,
  deceasedMemberDocumentStatuses,
  deceasedMemberDocumentTypes,
  memberStatus,
  memberTransferRequestStatuses,
  nameChangeRequestStatuses,
  reasonForLeaving,
  type DeceasedMemberDocumentStatus,
  type DeceasedMemberDocumentType,
  type MemberTransferRequestStatus,
  type NameChangeRequestStatus
} from './types'
import {
  sendDeathAnnouncementConfirmationEmail,
  sendLovedOneConfirmationEmail,
  sendLovedOneRemovalConfirmationEmail
} from './email'
import { contributionCreditPerVestedMember } from './sagicam-contribution-constants'
import { fetchSponsorContributionSummary } from './sagicam-contribution-summary'
import {
  fetchSponsorRegistrationSummary,
  registrationBalanceAdjustmentType,
  registrationFeePerEligibleMember
} from './sagicam-registration-summary'
import { sponsorPaymentLedgerEventTypes, sponsorPaymentTypes } from './sagicam-payment-ledger'
import { awaitingPublicationVestingLongevityDays, getAwaitingPublicationVestingCutoff } from './sagicam-member-longevity'
import { getOverdueRegistrationPaymentCreatedAtCutoff } from './registration-payment-deadline'
import {
  deleteDeathDocumentationFromCloudinary,
  isSameCloudinaryDocument,
  uploadDeathDocumentationToCloudinary,
  uploadNameChangeDocumentationToCloudinary
} from './cloudinary'
import { Prisma } from '@/generated/prisma/client'

const randomMatriculation = customAlphabet('1234567890', 6)

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const contributionBalanceAdjustmentType = 'contribution'

const registrationDateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
})

const contributionPaymentAlertType = 'contribution'
const registrationPaymentAlertType = 'registration'
const allPaymentAlertSponsorsCode = '__all__'
const MEMBER_REMOVAL_RESTORE_WINDOW_MS = 48 * 60 * 60 * 1000
const maxDocumentationFileSize = 20 * 1024 * 1024
const blockedDeceasedRestoreStatuses = new Set<string>([contributionStatus.underway, contributionStatus.completed])

const allowedDeceasedMemberDocumentMimeTypes = new Set([
  'application/pdf',
  'image/heic',
  'image/heif',
  'image/jpeg',
  'image/png',
  'image/webp'
])

const allowedDeceasedMemberDocumentExtensions = new Set(['.heic', '.heif', '.jpeg', '.jpg', '.pdf', '.png', '.webp'])

const formatRegistrationDate = (date: Date) => registrationDateFormatter.format(date)

const createPendingRegistrationUsage = async ({
  memberMatriculationNumber,
  sponsorCode
}: {
  memberMatriculationNumber: string
  sponsorCode: string
}) => {
  await db.sponsorRegistrationUsage.upsert({
    create: {
      amountUsed: registrationFeePerEligibleMember,
      memberMatriculationNumber,
      sponsorCode
    },
    update: {
      amountUsed: registrationFeePerEligibleMember,
      sponsorCode
    },
    where: {
      memberMatriculationNumber
    }
  })
}

const syncPendingRegistrationUsage = async ({
  memberMatriculationNumber,
  nextStatus,
  previousMatriculationNumber,
  previousStatus,
  sponsorCode
}: {
  memberMatriculationNumber: string
  nextStatus: string
  previousMatriculationNumber: string
  previousStatus: string
  sponsorCode: string
}) => {
  if (nextStatus !== memberStatus.Pending) {
    return
  }

  if (previousStatus === memberStatus.Pending && previousMatriculationNumber !== memberMatriculationNumber) {
    const updatedUsage = await db.sponsorRegistrationUsage.updateMany({
      data: {
        amountUsed: registrationFeePerEligibleMember,
        memberMatriculationNumber,
        sponsorCode
      },
      where: {
        memberMatriculationNumber: previousMatriculationNumber
      }
    })

    if (updatedUsage.count > 0) {
      return
    }
  }

  await createPendingRegistrationUsage({ memberMatriculationNumber, sponsorCode })
}

const createVestedContributionCredit = async ({
  memberMatriculationNumber,
  sponsorCode
}: {
  memberMatriculationNumber: string
  sponsorCode: string
}) => {
  await db.sponsorContributionCredit.upsert({
    create: {
      amountCredited: contributionCreditPerVestedMember,
      memberMatriculationNumber,
      sponsorCode
    },
    update: {
      amountCredited: contributionCreditPerVestedMember,
      sponsorCode
    },
    where: {
      memberMatriculationNumber
    }
  })
}

const removeVestedContributionCredit = async (memberMatriculationNumber: string) => {
  await db.sponsorContributionCredit.deleteMany({
    where: {
      memberMatriculationNumber
    }
  })
}

const addDeceasedMemberContributionUsage = async (sponsorCode: string) => {
  await db.sponsorContributionUsage.upsert({
    create: {
      amountUsed: contributionCreditPerVestedMember,
      sponsorCode
    },
    update: {
      amountUsed: {
        increment: contributionCreditPerVestedMember
      }
    },
    where: {
      sponsorCode
    }
  })
}

const updateVestedContributionCredit = async ({
  memberMatriculationNumber,
  previousMatriculationNumber,
  sponsorCode
}: {
  memberMatriculationNumber: string
  previousMatriculationNumber: string
  sponsorCode: string
}) => {
  await db.sponsorContributionCredit.updateMany({
    data: {
      amountCredited: contributionCreditPerVestedMember,
      memberMatriculationNumber,
      sponsorCode
    },
    where: {
      memberMatriculationNumber: previousMatriculationNumber
    }
  })
}

const syncVestedContributionCredit = async ({
  nextStatus,
  previousMatriculationNumber,
  previousStatus,
  sponsorCode,
  memberMatriculationNumber
}: {
  nextStatus: string
  previousMatriculationNumber: string
  previousStatus: string
  sponsorCode: string
  memberMatriculationNumber: string
}) => {
  if (previousStatus === memberStatus.Awaiting && nextStatus === memberStatus.Vested) {
    await createVestedContributionCredit({ memberMatriculationNumber, sponsorCode })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus === memberStatus.Vested) {
    await updateVestedContributionCredit({ memberMatriculationNumber, previousMatriculationNumber, sponsorCode })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus === memberStatus.Delinquent) {
    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus !== memberStatus.Vested) {
    await removeVestedContributionCredit(previousMatriculationNumber)
  }
}

const revalidateSponsorPaymentPages = () => {
  revalidatePath('/admin-payment-history')
  revalidatePath('/contributions-payments')
  revalidatePath('/registration-payments')
}

const upsertPaymentAlertReset = async (alertType: string, sponsorCode = allPaymentAlertSponsorsCode) => {
  await db.paymentAlertReset.upsert({
    create: {
      alertType,
      resetAt: new Date(),
      sponsorCode
    },
    update: {
      resetAt: new Date()
    },
    where: {
      alertType_sponsorCode: {
        alertType,
        sponsorCode
      }
    }
  })
}

const revalidateMemberPaymentViews = () => {
  revalidatePath('/admin-count')
  revalidatePath('/admin-members')
  revalidatePath('/admin-removed')
  revalidatePath('/admin-sagicam-payments')
  revalidatePath('/admin-sagicam-registrations')
  revalidatePath('/all-members')
  revalidateSponsorPaymentPages()
  revalidatePath('/deceased-members')
  revalidatePath('/removed-members')
}

const revalidateDeathDocumentationViews = () => {
  revalidatePath('/admin-deceased')
  revalidatePath('/admin-death-documentations')
  revalidatePath('/death-documentations')
  revalidatePath('/deceased-members')
}

const revalidateNameChangeDocumentationViews = () => {
  revalidatePath('/admin-members')
  revalidatePath('/admin-name-changes')
  revalidatePath('/all-members')
  revalidatePath('/name-change-documents-upload')
}

const revalidateMemberTransferViews = () => {
  revalidatePath('/admin-member-transfers')
  revalidatePath('/member-transfer')
}

const fetchSponsorByCode = async (sponsorCode: string) => {
  const sponsor = await db.profile.findUnique({
    where: {
      sponsorCode
    }
  })

  if (!sponsor) throw new Error('Sponsor profile not found')

  return sponsor
}

const isWithinMemberRemovalRestoreWindow = (createdAt: Date) =>
  Date.now() - createdAt.getTime() <= MEMBER_REMOVAL_RESTORE_WINDOW_MS

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

const assertAdminUser = async () => {
  const user = await getAuthUser()

  if (user.id !== process.env.ADMIN_USER_ID) {
    throw new Error('You are not authorized to access this admin page.')
  }

  return user
}

const renderError = (error: unknown): { message: string } => {
  console.log(error)

  return { message: error instanceof Error ? error.message : 'An error occurred' }
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getRequiredFormValue = (formData: FormData, fieldName: string) => {
  const value = String(formData.get(fieldName) ?? '').trim()

  if (!value) {
    throw new Error(`${fieldName} is required.`)
  }

  return value
}

const getRequiredDateFromForm = (formData: FormData, fieldName: string) => {
  const value = getRequiredFormValue(formData, fieldName)

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  const date = new Date(`${value}T12:00:00.000Z`)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`)
  }

  return date
}

const isDeceasedMemberDocumentType = (value: string): value is DeceasedMemberDocumentType =>
  deceasedMemberDocumentTypes.includes(value as DeceasedMemberDocumentType)

const isDeceasedMemberDocumentStatus = (value: string): value is DeceasedMemberDocumentStatus =>
  deceasedMemberDocumentStatuses.includes(value as DeceasedMemberDocumentStatus)

const isNameChangeRequestStatus = (value: string): value is NameChangeRequestStatus =>
  nameChangeRequestStatuses.includes(value as NameChangeRequestStatus)

const isMemberTransferRequestStatus = (value: string): value is MemberTransferRequestStatus =>
  memberTransferRequestStatuses.includes(value as MemberTransferRequestStatus)

const getFileExtension = (fileName: string) => {
  const extensionStart = fileName.lastIndexOf('.')

  return extensionStart >= 0 ? fileName.slice(extensionStart).toLowerCase() : ''
}

const isAllowedDeceasedMemberDocumentFile = (file: File) =>
  allowedDeceasedMemberDocumentMimeTypes.has(file.type) ||
  allowedDeceasedMemberDocumentExtensions.has(getFileExtension(file.name))

const getSafeDocumentFileName = (file: File, documentType: DeceasedMemberDocumentType) => {
  const fileName = file.name.trim()

  if (!fileName) return deceasedMemberDocumentLabels[documentType]

  return fileName.slice(0, 180)
}

const getSafeUploadedFileName = (file: File, fallbackFileName: string) => {
  const fileName = file.name.trim()

  if (!fileName) return fallbackFileName

  return fileName.slice(0, 180)
}

const getUppercaseFormName = (formData: FormData, fieldName: string) => {
  const value = getRequiredFormValue(formData, fieldName).toUpperCase()

  if (value.length < 2) {
    throw new Error(`${fieldName} should be at least 2 characters.`)
  }

  return value
}

type StoredCloudinaryDocumentFields = {
  cloudinaryDeliveryType?: string | null
  cloudinaryFormat?: string | null
  cloudinaryPublicId?: string | null
  cloudinaryResourceType?: string | null
  cloudinaryVersion?: number | null
  secureUrl?: string | null
}

const getStoredCloudinaryDocument = (document: StoredCloudinaryDocumentFields | null | undefined) => {
  if (!document?.cloudinaryPublicId || !document.cloudinaryResourceType || !document.cloudinaryDeliveryType) return null

  return {
    deliveryType: document.cloudinaryDeliveryType,
    format: document.cloudinaryFormat,
    publicId: document.cloudinaryPublicId,
    resourceType: document.cloudinaryResourceType,
    secureUrl: document.secureUrl,
    version: document.cloudinaryVersion
  }
}

const deleteStoredCloudinaryDocument = async (document: StoredCloudinaryDocumentFields | null | undefined) => {
  const storedDocument = getStoredCloudinaryDocument(document)

  if (!storedDocument) return

  try {
    await deleteDeathDocumentationFromCloudinary(storedDocument)
  } catch (error) {
    console.error('Unable to delete Cloudinary death document', error)
  }
}

const deleteStoredCloudinaryDocuments = async (documents: StoredCloudinaryDocumentFields[]) => {
  await Promise.all(documents.map(document => deleteStoredCloudinaryDocument(document)))
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

const getPositiveDollarAmountFromForm = (formData: FormData, fieldName: string) => {
  const amount = getDollarAmountFromForm(formData, fieldName)

  if (amount <= 0) {
    throw new Error('Enter an amount greater than zero.')
  }

  return amount
}

const getSignedDollarAdjustmentFromForm = (formData: FormData, fieldName: string) => {
  const rawAmount = String(formData.get(fieldName) ?? '')
    .replace(/[$,]/g, '')
    .trim()

  const amount = Number(rawAmount)

  if (!Number.isFinite(amount) || amount === 0) {
    throw new Error('Enter a valid non-zero dollar adjustment.')
  }

  return Number(amount.toFixed(2))
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

const fetchContributionCalculationSummary = async () => {
  const [summary, adminFee, vestedMembersCount] = await Promise.all([
    db.contributionCalculationDeath.aggregate({
      _count: {
        _all: true
      },
      _sum: {
        amountToContribute: true
      }
    }),
    db.contributionCalculationAdminFee.findUnique({
      where: {
        id: 'current'
      }
    }),
    db.member.count({
      where: {
        memberStatus: memberStatus.Vested
      }
    })
  ])

  const deathAmount = roundCurrencyAmount(decimalToNumber(summary._sum.amountToContribute))
  const adminFeeAmount = roundCurrencyAmount(decimalToNumber(adminFee?.amount))
  const adminFeeTotal = roundCurrencyAmount(adminFeeAmount * vestedMembersCount)

  return {
    adminFee: adminFeeAmount,
    adminFeeTotal,
    deathAmount,
    deathCount: summary._count._all,
    totalAmount: roundCurrencyAmount(deathAmount + adminFeeTotal),
    vestedMembersCount
  }
}

export const fetchContributionCalculationSummaryAction = async () => {
  await assertAdminUser()

  return fetchContributionCalculationSummary()
}

const fetchContributionCalculationDeaths = async () => {
  const calculationDeaths = await db.contributionCalculationDeath.findMany({
    include: {
      deceasedMember: {
        select: {
          dateOfDeath: true,
          firstName: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true,
          registrationDate: true,
          sponsorCode: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return calculationDeaths.map(calculationDeath => ({
    amountToContribute: decimalToNumber(calculationDeath.amountToContribute),
    createdAt: calculationDeath.createdAt.toISOString(),
    dateOfDeath: calculationDeath.deceasedMember.dateOfDeath,
    firstName: calculationDeath.deceasedMember.firstName,
    id: calculationDeath.id,
    lastAndMiddleNames: calculationDeath.deceasedMember.lastAndMiddleNames,
    memberMatriculationNumber: calculationDeath.deceasedMember.memberMatriculationNumber,
    registrationDate: calculationDeath.deceasedMember.registrationDate,
    sponsorCode: calculationDeath.deceasedMember.sponsorCode
  }))
}

export const fetchContributionCalculationDeathsAction = async () => {
  await assertAdminUser()

  return fetchContributionCalculationDeaths()
}

export const saveContributionCalculationAdminFeeAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const adminFee = getPositiveDollarAmountFromForm(formData, 'adminFee')

    await db.contributionCalculationAdminFee.upsert({
      create: {
        amount: adminFee,
        createdBy: user.id,
        id: 'current'
      },
      update: {
        amount: adminFee,
        createdBy: user.id
      },
      where: {
        id: 'current'
      }
    })

    revalidatePath('/admin-contribution-calculation')
    revalidatePath('/admin-sagicam-payments')

    return { message: `Admin fee saved: ${currencyFormatter.format(adminFee)}.` }
  } catch (error) {
    return renderError(error)
  }
}

export const addContributionCalculationDeathAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const memberMatriculationNumber = String(formData.get('memberMatriculationNumber') ?? '')
      .trim()
      .toUpperCase()

    const amountToContribute = Number(formData.get('amountToContribute'))

    if (!memberMatriculationNumber) {
      throw new Error('Enter the deceased loved one matriculation number.')
    }

    if (!Number.isFinite(amountToContribute) || amountToContribute <= 0) {
      throw new Error('Enter an amount greater than $0.00.')
    }

    const deceasedMember = await db.deceasedMember.findFirst({
      where: {
        memberMatriculationNumber
      },
      select: {
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true
      }
    })

    if (!deceasedMember) {
      throw new Error('No deceased loved one was found with that matriculation number.')
    }

    await db.contributionCalculationDeath.upsert({
      create: {
        amountToContribute: roundCurrencyAmount(amountToContribute),
        createdBy: user.id,
        deceasedMemberId: deceasedMember.id,
        memberMatriculationNumber: deceasedMember.memberMatriculationNumber
      },
      update: {
        amountToContribute: roundCurrencyAmount(amountToContribute),
        createdBy: user.id,
        memberMatriculationNumber: deceasedMember.memberMatriculationNumber
      },
      where: {
        deceasedMemberId: deceasedMember.id
      }
    })

    revalidatePath('/admin-contribution-calculation')

    return {
      message: `${deceasedMember.firstName} ${deceasedMember.lastAndMiddleNames} is ready for contribution calculation.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteContributionCalculationDeathAction = async (formData: FormData): Promise<void> => {
  await assertAdminUser()

  const contributionCalculationDeathId = String(formData.get('contributionCalculationDeathId') ?? '')

  if (!contributionCalculationDeathId) return

  await db.contributionCalculationDeath.delete({
    where: {
      id: contributionCalculationDeathId
    }
  })

  revalidatePath('/admin-contribution-calculation')
  revalidatePath('/admin-sagicam-payments')
}

export const createContributionAssessmentFromCalculationAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const dueDate = getRequiredDateFromForm(formData, 'dueDate')

    const [{ adminFee, deathAmount, deathCount }, calculationDeaths] = await Promise.all([
      fetchContributionCalculationSummary(),
      fetchContributionCalculationDeaths()
    ])

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

    const adminFeeTotal = roundCurrencyAmount(adminFee * vestedMembers.length)
    const totalAmount = roundCurrencyAmount(deathAmount + adminFeeTotal)

    if (deathCount === 0 || calculationDeaths.length === 0 || totalAmount <= 0) {
      throw new Error('Add at least one death with an amount in Contribution Calculation before publishing.')
    }

    const vestedMembersByCode = vestedMembers.reduce((counts, member) => {
      counts.set(member.sponsorCode, (counts.get(member.sponsorCode) ?? 0) + 1)

      return counts
    }, new Map<string, number>())

    const amountPerVestedMember = Number((totalAmount / vestedMembers.length).toFixed(2))

    const groupEntries = Array.from(vestedMembersByCode.entries()).map(([sponsorCode, vestedMembersCount]) => ({
      amountOwed: Number((amountPerVestedMember * vestedMembersCount).toFixed(2)),
      sponsorCode,
      vestedMembersCount
    }))

    await db.$transaction(async tx => {
      await tx.contributionAssessment.create({
        data: {
          amountPerVestedMember,
          deathCount,
          dueDate,
          totalAmount,
          totalVestedMembers: vestedMembers.length,
          deaths: {
            create: calculationDeaths.map(death => ({
              amountToContribute: death.amountToContribute,
              dateOfDeath: death.dateOfDeath,
              firstName: death.firstName,
              lastAndMiddleNames: death.lastAndMiddleNames,
              memberMatriculationNumber: death.memberMatriculationNumber,
              registrationDate: death.registrationDate,
              sponsorCode: death.sponsorCode
            }))
          },
          groups: {
            create: groupEntries
          }
        }
      })

      await tx.sponsorPaymentLedgerEntry.createMany({
        data: groupEntries.map(group => ({
          amount: group.amountOwed,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.dueOffset,
          note: `Contribution due created for ${group.vestedMembersCount} vested loved one(s). Number of deaths in calculation: ${deathCount}. Admin fee: ${currencyFormatter.format(adminFee)} x ${vestedMembers.length} vested loved one(s) = ${currencyFormatter.format(adminFeeTotal)}.`,
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode: group.sponsorCode
        }))
      })
    })

    revalidatePath('/admin-contribution-calculation')
    revalidatePath('/admin-payment-update')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
    revalidatePath('/contribution-table')
    revalidateSponsorPaymentPages()

    return {
      message: `Published contribution table for ${deathCount} death${deathCount === 1 ? '' : 's'} and distributed ${currencyFormatter.format(totalAmount)} across ${vestedMembers.length} vested loved ones.`
    }
  } catch (error) {
    return renderError(error)
  }
}

const contributionTableDeathCertificateDocumentTypes = ['death_certificate']
const contributionTableDocumentTypes = [...contributionTableDeathCertificateDocumentTypes, 'deceased_picture']

type ContributionTableDocument = {
  fileName: string
  id: string
  status: string
}

const getPreferredContributionTableDocuments = (
  documents: {
    deceasedMember: {
      memberMatriculationNumber: string
    }
    documentType: string
    fileName: string
    id: string
    status: string
  }[],
  documentTypes: string[]
) => {
  const documentsByMatriculationNumber = new Map<string, ContributionTableDocument>()

  documents
    .filter(document => documentTypes.includes(document.documentType))
    .forEach(document => {
      const memberMatriculationNumber = document.deceasedMember.memberMatriculationNumber
      const currentDocument = documentsByMatriculationNumber.get(memberMatriculationNumber)

      if (currentDocument?.status === 'approved') return

      documentsByMatriculationNumber.set(memberMatriculationNumber, {
        fileName: document.fileName,
        id: document.id,
        status: document.status
      })
    })

  return documentsByMatriculationNumber
}

const getSponsorDisplayName = (profile: {
  sponsorCode: string
  sponsorFirstName: string
  sponsorLastAndMiddleName: string
}) => `${profile.sponsorFirstName} ${profile.sponsorLastAndMiddleName}`.trim() || profile.sponsorCode

export const fetchPublishedContributionTableAction = async () => {
  await getAuthUser()
  noStore()

  const publishedAssessment = await db.contributionAssessment.findFirst({
    include: {
      deaths: {
        orderBy: {
          createdAt: 'asc'
        }
      },
      groups: {
        orderBy: {
          sponsorCode: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      deaths: {
        some: {}
      }
    }
  })

  if (!publishedAssessment) return null

  const sponsorCodes = publishedAssessment.groups.map(group => group.sponsorCode)
  const deathMatriculationNumbers = publishedAssessment.deaths.map(death => death.memberMatriculationNumber)

  const [profiles, contributionTableDocuments] = await Promise.all([
    db.profile.findMany({
      select: {
        sponsorCode: true,
        sponsorFirstName: true,
        sponsorLastAndMiddleName: true
      },
      where: {
        sponsorCode: {
          in: sponsorCodes
        }
      }
    }),
    db.deceasedMemberDocument.findMany({
      orderBy: {
        updatedAt: 'desc'
      },
      select: {
        deceasedMember: {
          select: {
            memberMatriculationNumber: true
          }
        },
        documentType: true,
        fileName: true,
        id: true,
        status: true
      },
      where: {
        deceasedMember: {
          memberMatriculationNumber: {
            in: deathMatriculationNumbers
          }
        },
        documentType: {
          in: contributionTableDocumentTypes
        },
        status: 'approved'
      }
    })
  ])

  const sponsorNamesByCode = new Map(profiles.map(profile => [profile.sponsorCode, getSponsorDisplayName(profile)]))

  const deathCertificatesByMatriculationNumber = getPreferredContributionTableDocuments(
    contributionTableDocuments,
    contributionTableDeathCertificateDocumentTypes
  )

  const deceasedPicturesByMatriculationNumber = getPreferredContributionTableDocuments(contributionTableDocuments, [
    'deceased_picture'
  ])

  return {
    amountPerVestedMember: decimalToNumber(publishedAssessment.amountPerVestedMember),
    createdAt: publishedAssessment.createdAt.toISOString(),
    deathCount: publishedAssessment.deathCount,
    deaths: publishedAssessment.deaths.map(death => ({
      amountToContribute: decimalToNumber(death.amountToContribute),
      createdAt: death.createdAt.toISOString(),
      dateOfDeath: death.dateOfDeath,
      deathCertificate: deathCertificatesByMatriculationNumber.get(death.memberMatriculationNumber) ?? null,
      deceasedPicture: deceasedPicturesByMatriculationNumber.get(death.memberMatriculationNumber) ?? null,
      firstName: death.firstName,
      id: death.id,
      lastAndMiddleNames: death.lastAndMiddleNames,
      memberMatriculationNumber: death.memberMatriculationNumber,
      registrationDate: death.registrationDate,
      sponsorCode: death.sponsorCode,
      sponsorName: sponsorNamesByCode.get(death.sponsorCode) ?? death.sponsorCode
    })),
    dueDate: publishedAssessment.dueDate?.toISOString() ?? null,
    groups: publishedAssessment.groups.map(group => ({
      amountOwed: decimalToNumber(group.amountOwed),
      sponsorCode: group.sponsorCode,
      sponsorName: sponsorNamesByCode.get(group.sponsorCode) ?? group.sponsorCode,
      vestedMembersCount: group.vestedMembersCount
    })),
    totalAmount: decimalToNumber(publishedAssessment.totalAmount),
    totalVestedMembers: publishedAssessment.totalVestedMembers
  }
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

    if (validatedFields.memberStatus === memberStatus.Pending) {
      await createPendingRegistrationUsage({
        memberMatriculationNumber,
        sponsorCode: validatedFields.sponsorCode
      })
    }

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

  return fetchSponsorContributionSummary(profile.sponsorCode, { noStore: true })
}

export const fetchCurrentSponsorRegistrationPayment = async () => {
  const profile = await fetchProfile()

  return fetchSponsorRegistrationSummary(profile.sponsorCode, { noStore: true })
}

export const fetchAdminSponsorDashboardPreviewAction = async (sponsorCodeInput: string) => {
  noStore()
  await assertAdminUser()

  const sponsorCode = sponsorCodeInput.trim().toUpperCase()

  if (!sponsorCode) return null

  const sponsor = await db.profile.findUnique({
    select: {
      sponsorCode: true,
      sponsorEmail: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true,
      sponsorPhoneNumber: true
    },
    where: {
      sponsorCode
    }
  })

  const [members, currentContribution, currentRegistrationPayment] = await Promise.all([
    db.member
      .findMany({
        orderBy: { createdAt: 'desc' },
        where: {
          sponsorCode
        }
      })
      .then(attachContributionAmounts),
    fetchSponsorContributionSummary(sponsorCode, { noStore: true }),
    fetchSponsorRegistrationSummary(sponsorCode, { noStore: true })
  ])

  if (!sponsor && members.length === 0) return null

  return {
    currentContribution,
    currentRegistrationPayment,
    members,
    sponsor: sponsor ?? {
      sponsorCode,
      sponsorEmail: '',
      sponsorFirstName: '',
      sponsorLastAndMiddleName: '',
      sponsorPhoneNumber: ''
    }
  }
}

export const fetchMembersForAdmin = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    // where: {},
    orderBy: { createdAt: 'desc' },
    select: {
      clerkId: true,
      countryOfBirth: true,
      createdAt: true,
      dateOfBirth: true,
      delegateRecommendation: true,
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true,
      memberStatus: true,
      nameOfBeneficiary: true,
      sponsorCode: true,
      updatedAt: true
    }
  })

  return attachContributionAmounts(members)
}

export const createContributionAssessmentAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

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

    const groupEntries = Array.from(vestedMembersByCode.entries()).map(([sponsorCode, vestedMembersCount]) => ({
      amountOwed: Number((amountPerVestedMember * vestedMembersCount).toFixed(2)),
      sponsorCode,
      vestedMembersCount
    }))

    await db.$transaction(async tx => {
      await tx.contributionAssessment.create({
        data: {
          amountPerVestedMember,
          totalAmount,
          totalVestedMembers: vestedMembers.length,
          groups: {
            create: groupEntries
          }
        }
      })

      await tx.sponsorPaymentLedgerEntry.createMany({
        data: groupEntries.map(group => ({
          amount: group.amountOwed,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.dueOffset,
          note: `Contribution due created for ${group.vestedMembersCount} vested loved one(s).`,
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode: group.sponsorCode
        }))
      })
    })

    revalidatePath('/admin-members')
    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()

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
    const submittedAt = new Date()

    const payment = await db.$transaction(async tx => {
      const payment = await tx.sponsorContributionPayment.upsert({
        create: {
          amountSent,
          lastSubmittedAt: submittedAt,
          sponsorCode: profile.sponsorCode
        },
        update: {
          amountSent: {
            increment: amountSent
          },
          lastSubmittedAt: submittedAt
        },
        where: {
          sponsorCode: profile.sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountSent,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.submitted,
          note: 'Contribution payment submitted by sponsor.',
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode: profile.sponsorCode
        }
      })

      return payment
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()

    return {
      message: `Added amount sent: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const verifySponsorContributionPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

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
    const amountVerified = decimalToNumber(payment.amountVerified)
    const amountToVerify = Number((amountSent - amountVerified).toFixed(2))

    if (amountToVerify <= 0) {
      throw new Error('No new contribution amount sent to verify.')
    }

    await db.$transaction(async tx => {
      await tx.sponsorContributionPayment.update({
        data: {
          amountVerified: amountSent,
          verifiedAt: new Date()
        },
        where: {
          sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountToVerify,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.verified,
          note: 'Contribution payment verified by SAGICAM.',
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode
        }
      })
    })

    await upsertPaymentAlertReset(contributionPaymentAlertType, sponsorCode)

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

export const adjustSponsorContributionAmountSentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const amountAdjustment = getSignedDollarAdjustmentFromForm(formData, 'amountSentAdjustment')

    const currentPayment = await db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    const currentAmountSent = decimalToNumber(currentPayment?.amountSent)
    const currentAmountVerified = decimalToNumber(currentPayment?.amountVerified)
    const nextAmountSent = Number((currentAmountSent + amountAdjustment).toFixed(2))
    const nextAmountVerified = Math.min(currentAmountVerified, nextAmountSent)
    const verifiedAmountAdjustment = Number((nextAmountVerified - currentAmountVerified).toFixed(2))

    if (nextAmountSent < 0) {
      throw new Error('Contribution amount sent cannot be below zero.')
    }

    await db.$transaction(async tx => {
      await tx.sponsorContributionPayment.upsert({
        create: {
          amountSent: nextAmountSent,
          amountVerified: 0,
          lastSubmittedAt: null,
          sponsorCode,
          verifiedAt: null
        },
        update: {
          amountSent: nextAmountSent,
          amountVerified: nextAmountVerified,
          verifiedAt: nextAmountVerified > 0 ? currentPayment?.verifiedAt : null
        },
        where: {
          sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountAdjustment,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.submitted,
          note: 'Contribution amount sent manually adjusted by SAGICAM.',
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode
        }
      })

      if (verifiedAmountAdjustment !== 0) {
        await tx.sponsorPaymentLedgerEntry.create({
          data: {
            amount: verifiedAmountAdjustment,
            createdBy: user.id,
            eventType: sponsorPaymentLedgerEventTypes.verified,
            note: 'Contribution verified amount adjusted by SAGICAM to match sent correction.',
            paymentType: sponsorPaymentTypes.contribution,
            sponsorCode
          }
        })
      }
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

const addSponsorBalanceAdjustment = async (formData: FormData, balanceType: string): Promise<void> => {
  const user = await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const amount = getSignedDollarAdjustmentFromForm(formData, 'balanceAmount')

    await db.$transaction(async tx => {
      await tx.sponsorBalanceAdjustment.upsert({
        create: {
          amount,
          balanceType,
          sponsorCode
        },
        update: {
          amount: {
            increment: amount
          }
        },
        where: {
          sponsorCode_balanceType: {
            balanceType,
            sponsorCode
          }
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.manualAdjustment,
          note: `${balanceType} balance manually adjusted by SAGICAM.`,
          paymentType: balanceType,
          sponsorCode
        }
      })
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

export const addSponsorContributionBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addSponsorBalanceAdjustment(formData, contributionBalanceAdjustmentType)
}

export const resetSponsorContributionPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const contributionSummary = await fetchSponsorContributionSummary(sponsorCode)

    const preservedBalanceAdjustment = Number(
      (
        contributionSummary.balance +
        contributionSummary.totalAmountUsed -
        contributionSummary.vestedContributionCredit
      ).toFixed(2)
    )

    const currentPayment = await db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    await db.$transaction(async tx => {
      await tx.sponsorContributionPayment.upsert({
        create: {
          amountSent: 0,
          amountVerified: 0,
          lastSubmittedAt: null,
          sponsorCode,
          verifiedAt: null
        },
        update: {
          amountSent: 0,
          amountVerified: 0,
          lastSubmittedAt: null,
          verifiedAt: null
        },
        where: {
          sponsorCode
        }
      })

      await tx.sponsorBalanceAdjustment.upsert({
        create: {
          amount: preservedBalanceAdjustment,
          balanceType: contributionBalanceAdjustmentType,
          sponsorCode
        },
        update: {
          amount: preservedBalanceAdjustment
        },
        where: {
          sponsorCode_balanceType: {
            balanceType: contributionBalanceAdjustmentType,
            sponsorCode
          }
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: 0,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.reset,
          note: `Contribution payment totals reset. Cleared sent ${currencyFormatter.format(decimalToNumber(currentPayment?.amountSent))} and verified ${currencyFormatter.format(decimalToNumber(currentPayment?.amountVerified))}.`,
          paymentType: sponsorPaymentTypes.contribution,
          sponsorCode
        }
      })
    })

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
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
    const submittedAt = new Date()

    const payment = await db.$transaction(async tx => {
      const payment = await tx.sponsorRegistrationPayment.upsert({
        create: {
          amountSent,
          lastSubmittedAt: submittedAt,
          sponsorCode: profile.sponsorCode
        },
        update: {
          amountSent: {
            increment: amountSent
          },
          lastSubmittedAt: submittedAt
        },
        where: {
          sponsorCode: profile.sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountSent,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.submitted,
          note: 'Registration payment submitted by sponsor.',
          paymentType: sponsorPaymentTypes.registration,
          sponsorCode: profile.sponsorCode
        }
      })

      return payment
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()

    return {
      message: `Added registration amount sent: ${currencyFormatter.format(amountSent)}. Total sent: ${currencyFormatter.format(decimalToNumber(payment.amountSent))}.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const verifySponsorRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

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

    if (amountSent <= 0) {
      throw new Error('No registration amount sent to verify.')
    }

    await db.$transaction(async tx => {
      await tx.sponsorRegistrationPayment.update({
        data: {
          amountSent: 0,
          amountVerified: {
            increment: amountSent
          },
          verifiedAt: new Date()
        },
        where: {
          sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountSent,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.verified,
          note: 'Registration payment verified by SAGICAM.',
          paymentType: sponsorPaymentTypes.registration,
          sponsorCode
        }
      })
    })

    await upsertPaymentAlertReset(registrationPaymentAlertType, sponsorCode)

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

export const adjustSponsorRegistrationAmountSentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const amountAdjustment = getSignedDollarAdjustmentFromForm(formData, 'registrationAmountSentAdjustment')

    const currentPayment = await db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    const currentAmountSent = decimalToNumber(currentPayment?.amountSent)
    const nextAmountSent = Number((currentAmountSent + amountAdjustment).toFixed(2))

    if (nextAmountSent < 0) {
      throw new Error('Registration amount sent cannot be below zero.')
    }

    await db.$transaction(async tx => {
      await tx.sponsorRegistrationPayment.upsert({
        create: {
          amountSent: nextAmountSent,
          amountVerified: 0,
          lastSubmittedAt: null,
          sponsorCode,
          verifiedAt: null
        },
        update: {
          amountSent: nextAmountSent
        },
        where: {
          sponsorCode
        }
      })

      await tx.sponsorPaymentLedgerEntry.create({
        data: {
          amount: amountAdjustment,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.submitted,
          note: 'Registration amount sent manually adjusted by SAGICAM.',
          paymentType: sponsorPaymentTypes.registration,
          sponsorCode
        }
      })
    })

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

export const addSponsorRegistrationBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addSponsorBalanceAdjustment(formData, registrationBalanceAdjustmentType)
}

export const resetSponsorRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  const user = await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const registrationSummary = await fetchSponsorRegistrationSummary(sponsorCode)
    const preservedBalanceAdjustment = Number((registrationSummary.balance + registrationSummary.amountUsed).toFixed(2))

    const currentPayment = await db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    await db.$transaction([
      db.sponsorRegistrationPayment.upsert({
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
      }),
      db.sponsorBalanceAdjustment.upsert({
        create: {
          amount: preservedBalanceAdjustment,
          balanceType: registrationBalanceAdjustmentType,
          sponsorCode
        },
        update: {
          amount: preservedBalanceAdjustment
        },
        where: {
          sponsorCode_balanceType: {
            balanceType: registrationBalanceAdjustmentType,
            sponsorCode
          }
        }
      }),
      db.sponsorPaymentLedgerEntry.create({
        data: {
          amount: 0,
          createdBy: user.id,
          eventType: sponsorPaymentLedgerEventTypes.reset,
          note: `Registration payment totals reset. Cleared sent ${currencyFormatter.format(decimalToNumber(currentPayment?.amountSent))} and verified ${currencyFormatter.format(decimalToNumber(currentPayment?.amountVerified))}.`,
          paymentType: sponsorPaymentTypes.registration,
          sponsorCode
        }
      })
    ])

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
    revalidateSponsorPaymentPages()
  } catch (error) {
    renderError(error)
  }
}

const resetPaymentAlert = async (alertType: string, formData?: FormData) => {
  await getAuthUser()

  const sponsorCode = String(formData?.get('sponsorCode') ?? '').trim()

  await upsertPaymentAlertReset(alertType, sponsorCode || allPaymentAlertSponsorsCode)

  revalidatePath('/admin-sagicam-payments')
  revalidatePath('/admin-sagicam-registrations')
}

export const resetContributionPaymentAlertAction = async (formData: FormData): Promise<void> => {
  await resetPaymentAlert(contributionPaymentAlertType, formData)
}

export const resetRegistrationPaymentAlertAction = async (formData: FormData): Promise<void> => {
  await resetPaymentAlert(registrationPaymentAlertType, formData)
}

export const resetContributionCalculationAction = async (): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const [
      contributionAssessments,
      sponsorContributionPayments,
      calculationDeathCount,
      calculationAdminFeeCount
    ] = await Promise.all([
      db.contributionAssessment.findMany({
        include: {
          groups: true
        }
      }),
      db.sponsorContributionPayment.findMany({
        where: {
          OR: [{ amountSent: { gt: 0 } }, { amountVerified: { gt: 0 } }]
        }
      }),
      db.contributionCalculationDeath.count(),
      db.contributionCalculationAdminFee.count()
    ])

    if (
      contributionAssessments.length === 0 &&
      sponsorContributionPayments.length === 0 &&
      calculationDeathCount === 0 &&
      calculationAdminFeeCount === 0
    ) {
      return { message: 'No contribution values found to reset.' }
    }

    const assessedAmountByCode = contributionAssessments.reduce((amountsByCode, assessment) => {
      assessment.groups.forEach(group => {
        const currentAmount = amountsByCode.get(group.sponsorCode) ?? 0
        const nextAmount = Number((currentAmount + decimalToNumber(group.amountOwed)).toFixed(2))

        amountsByCode.set(group.sponsorCode, nextAmount)
      })

      return amountsByCode
    }, new Map<string, number>())

    const affectedSponsorCodes = Array.from(
      new Set([
        ...assessedAmountByCode.keys(),
        ...sponsorContributionPayments.map(payment => payment.sponsorCode)
      ])
    )

    const contributionSummaries = await Promise.all(
      affectedSponsorCodes.map(sponsorCode => fetchSponsorContributionSummary(sponsorCode))
    )

    const balanceAdjustments = contributionSummaries.map(summary => {
      const assessedAmount = assessedAmountByCode.get(summary.sponsorCode) ?? 0
      const totalAmountUsedAfterReset = Number((summary.totalAmountUsed - assessedAmount).toFixed(2))

      return {
        amount: Number((summary.balance - summary.vestedContributionCredit + totalAmountUsedAfterReset).toFixed(2)),
        sponsorCode: summary.sponsorCode
      }
    })

    const resetLedgerEntries = contributionSummaries.map(summary => ({
      amount: assessedAmountByCode.get(summary.sponsorCode) ?? 0,
      createdBy: user.id,
      eventType: sponsorPaymentLedgerEventTypes.reset,
      note: 'Contribution calculation reset. Contribution owed, sent, and verified values were cleared; balance/deficit was preserved.',
      paymentType: sponsorPaymentTypes.contribution,
      sponsorCode: summary.sponsorCode
    }))

    const assessmentIds = contributionAssessments.map(assessment => assessment.id)
    const paymentSponsorCodes = sponsorContributionPayments.map(payment => payment.sponsorCode)

    const resetOperations: Prisma.PrismaPromise<unknown>[] = [
      ...(paymentSponsorCodes.length > 0
        ? [
            db.sponsorContributionPayment.updateMany({
              data: {
                amountSent: 0,
                amountVerified: 0,
                lastSubmittedAt: null,
                verifiedAt: null
              },
              where: {
                sponsorCode: {
                  in: paymentSponsorCodes
                }
              }
            })
          ]
        : []),
      ...balanceAdjustments.map(adjustment =>
        db.sponsorBalanceAdjustment.upsert({
          create: {
            amount: adjustment.amount,
            balanceType: contributionBalanceAdjustmentType,
            sponsorCode: adjustment.sponsorCode
          },
          update: {
            amount: adjustment.amount
          },
          where: {
            sponsorCode_balanceType: {
              balanceType: contributionBalanceAdjustmentType,
              sponsorCode: adjustment.sponsorCode
            }
          }
        })
      ),
      ...(resetLedgerEntries.length > 0
        ? [
            db.sponsorPaymentLedgerEntry.createMany({
              data: resetLedgerEntries
            })
          ]
        : []),
      ...(assessmentIds.length > 0
        ? [
            db.contributionAssessmentGroup.deleteMany({
              where: {
                assessmentId: {
                  in: assessmentIds
                }
              }
            }),
            db.contributionAssessment.deleteMany({
              where: {
                id: {
                  in: assessmentIds
                }
              }
            })
          ]
        : []),
      db.contributionCalculationDeath.deleteMany(),
      db.contributionCalculationAdminFee.deleteMany()
    ]

    await db.$transaction(resetOperations)

    revalidatePath('/admin-count')
    revalidatePath('/admin-contribution-calculation')
    revalidatePath('/admin-payment-update')
    revalidatePath('/admin-members')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/all-members')
    revalidatePath('/contribution-table')
    revalidateSponsorPaymentPages()

    return {
      message: 'Contribution reset successfully. Contribution owed, sent, and verified were cleared while balance/deficit was preserved.'
    }
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

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })

    if (currentMember) {
      await syncPendingRegistrationUsage({
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus,
        sponsorCode: validatedFields.sponsorCode
      })

      await syncVestedContributionCredit({
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus,
        sponsorCode: validatedFields.sponsorCode
      })
    }

    revalidatePath(`all-members/${memberId}/edit`)
    revalidateMemberPaymentViews()

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

    const currentMember = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.member.update({
      where: {
        id: memberId
      },
      data: {
        ...validatedFields
      }
    })

    if (currentMember) {
      await syncPendingRegistrationUsage({
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus,
        sponsorCode: validatedFields.sponsorCode
      })

      await syncVestedContributionCredit({
        memberMatriculationNumber: currentMember.memberMatriculationNumber,
        nextStatus: validatedFields.memberStatus,
        previousMatriculationNumber: currentMember.memberMatriculationNumber,
        previousStatus: currentMember.memberStatus,
        sponsorCode: validatedFields.sponsorCode
      })
    }

    revalidatePath(`admin-members/${memberId}/edit`)
    revalidateMemberPaymentViews()

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

export const vestEligibleAwaitingPublicationMembersAction = async (): Promise<{ message: string }> => {
  await assertAdminUser()

  try {
    const cutoffAt = getAwaitingPublicationVestingCutoff()

    const eligibleMembers = await db.member.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        id: true,
        memberMatriculationNumber: true,
        sponsorCode: true
      },
      where: {
        createdAt: {
          lte: cutoffAt
        },
        memberStatus: memberStatus.Awaiting
      }
    })

    if (eligibleMembers.length === 0) {
      return {
        message: `No Awaiting Publication loved ones with at least ${awaitingPublicationVestingLongevityDays} days of longevity were found.`
      }
    }

    let vestedCount = 0

    await db.$transaction(async tx => {
      for (const member of eligibleMembers) {
        const updatedMember = await tx.member.updateMany({
          data: {
            memberStatus: memberStatus.Vested
          },
          where: {
            createdAt: {
              lte: cutoffAt
            },
            id: member.id,
            memberStatus: memberStatus.Awaiting
          }
        })

        if (updatedMember.count === 0) {
          continue
        }

        await tx.sponsorContributionCredit.upsert({
          create: {
            amountCredited: contributionCreditPerVestedMember,
            memberMatriculationNumber: member.memberMatriculationNumber,
            sponsorCode: member.sponsorCode
          },
          update: {
            amountCredited: contributionCreditPerVestedMember,
            sponsorCode: member.sponsorCode
          },
          where: {
            memberMatriculationNumber: member.memberMatriculationNumber
          }
        })

        vestedCount += updatedMember.count
      }
    })

    revalidateMemberPaymentViews()
    revalidatePath('/admin-users-contacts')
    revalidatePath('/new-additions')

    if (vestedCount === 0) {
      return {
        message: 'No loved ones were moved because the eligible records changed before the action completed.'
      }
    }

    return {
      message: `${vestedCount} loved one${vestedCount === 1 ? '' : 's'} moved to Vested. ${currencyFormatter.format(
        vestedCount * contributionCreditPerVestedMember
      )} in sponsor contribution credit was applied.`
    }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchNameChangeDocumentationPageAction = async () => {
  const user = await getAuthUser()

  const members = await db.member.findMany({
    orderBy: [{ sponsorCode: 'asc' }, { lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
    select: {
      clerkId: true,
      firstName: true,
      id: true,
      lastAndMiddleNames: true,
      memberMatriculationNumber: true,
      sponsorCode: true
    },
    where: { clerkId: user.id }
  })

  const requests = await db.nameChangeRequest
    .findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: { clerkId: user.id }
    })
    .catch(error => {
      console.error('Unable to load name change requests', error)

      return []
    })

  return { members, requests }
}

export const fetchAdminNameChangeRequestsAction = async () => {
  await assertAdminUser()

  return db.nameChangeRequest
    .findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
    .catch(error => {
      console.error('Unable to load admin name change requests', error)

      return []
    })
}

export const submitNameChangeRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = String(formData.get('memberId') ?? '').trim()
    const requestedFirstName = getUppercaseFormName(formData, 'requestedFirstName')
    const requestedLastAndMiddleNames = getUppercaseFormName(formData, 'requestedLastAndMiddleNames')

    if (!memberId) {
      throw new Error('Select a loved one before submitting the name change.')
    }

    const member = await db.member.findUnique({
      select: {
        clerkId: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        sponsorCode: true
      },
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error('Loved one not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && member.clerkId !== user.id) {
      throw new Error('You can only request name changes for loved ones from your own account.')
    }

    if (member.firstName === requestedFirstName && member.lastAndMiddleNames === requestedLastAndMiddleNames) {
      throw new Error('Enter a new name before submitting the request.')
    }

    const pendingRequest = await db.nameChangeRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: ['submitted', 'documentation_requested']
        }
      }
    })

    if (pendingRequest) {
      throw new Error('This loved one already has a name change request waiting for admin review.')
    }

    const requestId = randomUUID()

    await db.nameChangeRequest.create({
      data: {
        id: requestId,
        clerkId: member.clerkId,
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        documentRequired: false,
        memberId: member.id,
        reason: 'typo_or_error',
        requestedFirstName,
        requestedLastAndMiddleNames,
        sponsorCode: member.sponsorCode,
        status: 'submitted'
      }
    })

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change request submitted for admin review' }
  } catch (error) {
    return renderError(error)
  }
}

export const uploadNameChangeDocumentationAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const file = formData.get('documentFile')

    if (!(file instanceof File) || file.size <= 0) {
      throw new Error('Please choose the requested documentation.')
    }

    if (file.size > maxDocumentationFileSize) {
      throw new Error('The file is too large. Please upload a file that is 20 MB or smaller.')
    }

    if (!isAllowedDeceasedMemberDocumentFile(file)) {
      throw new Error('Please upload a PDF, JPG, PNG, WEBP, HEIC, or HEIF file.')
    }

    const request = await db.nameChangeRequest.findUnique({
      select: {
        clerkId: true,
        cloudinaryDeliveryType: true,
        cloudinaryFormat: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        cloudinaryVersion: true,
        id: true,
        secureUrl: true,
        sponsorCode: true,
        status: true
      },
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && request.clerkId !== user.id) {
      throw new Error('You can only upload documentation for name changes from your own account.')
    }

    if (request.status !== 'documentation_requested') {
      throw new Error('Documentation has not been requested for this name change.')
    }

    const safeFileName = getSafeUploadedFileName(file, 'Official name change document')
    const previousDocument = getStoredCloudinaryDocument(request)

    const uploadedDocument = await uploadNameChangeDocumentationToCloudinary({
      buffer: Buffer.from(await file.arrayBuffer()),
      fileName: safeFileName,
      requestId: request.id,
      sponsorCode: request.sponsorCode
    })

    try {
      await db.nameChangeRequest.update({
        data: {
          cloudinaryDeliveryType: uploadedDocument.deliveryType,
          cloudinaryFormat: uploadedDocument.format,
          cloudinaryPublicId: uploadedDocument.publicId,
          cloudinaryResourceType: uploadedDocument.resourceType,
          cloudinaryVersion: uploadedDocument.version,
          documentRequired: true,
          fileName: safeFileName,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          rejectionReason: null,
          reviewedAt: null,
          reviewedBy: null,
          secureUrl: uploadedDocument.secureUrl,
          status: 'submitted'
        },
        where: {
          id: request.id
        }
      })
    } catch (error) {
      await deleteDeathDocumentationFromCloudinary(uploadedDocument)

      throw error
    }

    if (previousDocument && !isSameCloudinaryDocument(previousDocument, uploadedDocument)) {
      await deleteStoredCloudinaryDocument(request)
    }

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change documentation uploaded successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewNameChangeRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isNameChangeRequestStatus(status) || status === 'submitted') {
      throw new Error('Select a valid review decision.')
    }

    const request = await db.nameChangeRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    if (request.status !== 'submitted') {
      throw new Error('This name change request has already been reviewed.')
    }

    if (status === 'approved' && request.documentRequired && !request.cloudinaryPublicId) {
      throw new Error('Documentation is required before approving this name change.')
    }

    if (status === 'documentation_requested') {
      await db.nameChangeRequest.update({
        data: {
          documentRequired: true,
          rejectionReason: rejectionReason || 'Please upload official documentation for this name change.',
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
      })

      revalidateNameChangeDocumentationViews()

      return { message: 'Name change documentation requested' }
    }

    if (status === 'approved') {
      await db.$transaction([
        db.member.update({
          data: {
            firstName: request.requestedFirstName,
            lastAndMiddleNames: request.requestedLastAndMiddleNames
          },
          where: {
            id: request.memberId
          }
        }),
        db.nameChangeRequest.update({
          data: {
            rejectionReason: null,
            reviewedAt: new Date(),
            reviewedBy: user.id,
            status
          },
          where: {
            id: request.id
          }
        })
      ])
    } else {
      await db.nameChangeRequest.update({
        data: {
          rejectionReason: rejectionReason || 'Please submit corrected information or documentation.',
          reviewedAt: new Date(),
          reviewedBy: user.id,
          status
        },
        where: {
          id: request.id
        }
      })
    }

    revalidateMemberPaymentViews()
    revalidateNameChangeDocumentationViews()

    return { message: `Name change request ${status}` }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'A loved one with these identifying details already exists.' }
    }

    return renderError(error)
  }
}

export const deleteNameChangeRequestAction = async (prevState: { requestId: string }) => {
  const user = await getAuthUser()
  const { requestId } = prevState

  try {
    const request = await db.nameChangeRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Name change request not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && request.clerkId !== user.id) {
      throw new Error('You can only remove name change requests from your own account.')
    }

    await db.nameChangeRequest.delete({
      where: {
        id: request.id
      }
    })

    await deleteStoredCloudinaryDocument(request)

    revalidateNameChangeDocumentationViews()

    return { message: 'Name change request removed successfully' }
  } catch (error) {
    return renderError(error)
  }
}

const openMemberTransferRequestStatuses: MemberTransferRequestStatus[] = [
  'receiving_sponsor_pending',
  'receiving_sponsor_approved'
]

const canCancelMemberTransferRequestStatus = (status: string) =>
  isMemberTransferRequestStatus(status) && status !== 'admin_approved' && status !== 'cancelled'

const CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS = 5 * 60 * 1000

const getVisibleMemberTransferRequestWhere = () => ({
  OR: [
    {
      status: {
        not: 'cancelled'
      }
    },
    {
      updatedAt: {
        gte: new Date(Date.now() - CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS)
      }
    }
  ]
})

const getNextCancelledMemberTransferRefreshAt = (requests: { status: string; updatedAt: Date }[]) => {
  const nextRefreshAt = requests
    .filter(request => request.status === 'cancelled')
    .map(request => request.updatedAt.getTime() + CANCELLED_MEMBER_TRANSFER_CARD_VISIBILITY_MS)
    .filter(refreshAt => refreshAt > Date.now())
    .sort((firstRefreshAt, secondRefreshAt) => firstRefreshAt - secondRefreshAt)[0]

  return nextRefreshAt ? new Date(nextRefreshAt).toISOString() : null
}

const getTransferredMemberMatriculationNumber = ({
  initiatingSponsorCode,
  memberMatriculationNumber,
  receivingSponsorCode
}: {
  initiatingSponsorCode: string
  memberMatriculationNumber: string
  receivingSponsorCode: string
}) => {
  const initiatingPrefix = `SC${initiatingSponsorCode}`

  if (!memberMatriculationNumber.startsWith(initiatingPrefix)) {
    throw new Error('This loved one matriculation number does not match the current sponsor code.')
  }

  return `SC${receivingSponsorCode}${memberMatriculationNumber.slice(initiatingPrefix.length)}`
}

export const fetchMemberTransferPageAction = async () => {
  noStore()

  const profile = await fetchProfile()
  const visibleMemberTransferRequestWhere = getVisibleMemberTransferRequestWhere()

  const [members, requests] = await Promise.all([
    db.member.findMany({
      orderBy: [{ lastAndMiddleNames: 'asc' }, { firstName: 'asc' }],
      select: {
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true,
        sponsorCode: true
      },
      where: {
        clerkId: {
          not: profile.clerkId
        }
      }
    }),
    db.memberTransferRequest.findMany({
      include: {
        member: {
          select: {
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true,
            sponsorCode: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      where: {
        AND: [
          {
            OR: [{ initiatingClerkId: profile.clerkId }, { receivingClerkId: profile.clerkId }]
          },
          visibleMemberTransferRequestWhere
        ]
      }
    })
  ])

  return {
    members,
    nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests),
    profile,
    requests
  }
}

export const fetchAdminMemberTransferPageAction = async () => {
  noStore()
  await assertAdminUser()

  const requests = await db.memberTransferRequest.findMany({
    include: {
      member: {
        select: {
          clerkId: true,
          firstName: true,
          lastAndMiddleNames: true,
          memberMatriculationNumber: true,
          sponsorCode: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    where: getVisibleMemberTransferRequestWhere()
  })

  return { nextCancelledTransferRefreshAt: getNextCancelledMemberTransferRefreshAt(requests), requests }
}

export const submitMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = getRequiredFormValue(formData, 'memberId')
    const receivingSponsor = await fetchProfile()

    const member = await db.member.findUnique({
      select: {
        clerkId: true,
        firstName: true,
        id: true,
        lastAndMiddleNames: true,
        memberMatriculationNumber: true,
        memberStatus: true,
        sponsorCode: true
      },
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error('Loved one not found.')
    }

    if (member.clerkId === user.id || member.sponsorCode === receivingSponsor.sponsorCode) {
      throw new Error('This loved one is already in your sponsor group.')
    }

    const releasingSponsor = await db.profile.findFirst({
      select: {
        clerkId: true,
        sponsorCode: true
      },
      where: {
        clerkId: member.clerkId,
        sponsorCode: member.sponsorCode
      }
    })

    if (!releasingSponsor) {
      throw new Error('Current sponsor profile was not found.')
    }

    const openRequest = await db.memberTransferRequest.findFirst({
      select: {
        id: true
      },
      where: {
        memberId: member.id,
        status: {
          in: openMemberTransferRequestStatuses
        }
      }
    })

    if (openRequest) {
      throw new Error('This loved one already has a member transfer request in progress.')
    }

    await db.memberTransferRequest.create({
      data: {
        currentFirstName: member.firstName,
        currentLastAndMiddleNames: member.lastAndMiddleNames,
        initiatingClerkId: releasingSponsor.clerkId,
        initiatingSponsorCode: releasingSponsor.sponsorCode,
        memberId: member.id,
        memberMatriculationNumber: member.memberMatriculationNumber,
        receivingClerkId: receivingSponsor.clerkId,
        receivingSponsorCode: receivingSponsor.sponsorCode,
        status: 'receiving_sponsor_pending'
      }
    })

    revalidateMemberTransferViews()

    return { message: 'Member transfer release request sent to the current sponsor.' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewIncomingMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (
      !isMemberTransferRequestStatus(status) ||
      !['receiving_sponsor_approved', 'receiving_sponsor_rejected'].includes(status)
    ) {
      throw new Error('Select a valid transfer decision.')
    }

    if (status === 'receiving_sponsor_rejected' && !rejectionReason) {
      throw new Error('Give the reason to reject the release.')
    }

    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Member transfer request not found.')
    }

    if (request.initiatingClerkId !== user.id) {
      throw new Error('Only the current sponsor can release this loved one.')
    }

    if (request.status !== 'receiving_sponsor_pending') {
      throw new Error('This transfer request has already been reviewed by the current sponsor.')
    }

    await db.memberTransferRequest.update({
      data: {
        receivingReviewedAt: new Date(),
        receivingReviewedBy: user.id,
        rejectionReason: status === 'receiving_sponsor_rejected' ? rejectionReason : null,
        status
      },
      where: {
        id: request.id
      }
    })

    revalidateMemberTransferViews()

    return {
      message:
        status === 'receiving_sponsor_approved'
          ? 'Loved one release approved and sent to SAGICAM admin.'
          : 'Member transfer release rejected.'
    }
  } catch (error) {
    return renderError(error)
  }
}

export const cancelMemberTransferRequestAction = async (prevState: { requestId: string }) => {
  const user = await getAuthUser()
  const { requestId } = prevState

  try {
    const request = await db.memberTransferRequest.findUnique({
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Member transfer request not found.')
    }

    if (request.receivingClerkId !== user.id) {
      throw new Error('Only the receiving sponsor who requested this transfer can cancel it.')
    }

    if (request.status === 'cancelled') {
      throw new Error('This member transfer request has already been cancelled.')
    }

    if (!canCancelMemberTransferRequestStatus(request.status)) {
      throw new Error('This member transfer request can no longer be cancelled because SAGICAM admin has approved it.')
    }

    await db.memberTransferRequest.update({
      data: {
        rejectionReason: 'Receiving sponsor cancelled this transfer request.',
        status: 'cancelled'
      },
      where: {
        id: request.id
      }
    })

    revalidateMemberTransferViews()

    return { message: 'Member transfer request cancelled.' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewAdminMemberTransferRequestAction = async (
  prevState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await assertAdminUser()

  try {
    const requestId = getRequiredFormValue(formData, 'requestId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isMemberTransferRequestStatus(status) || !['admin_approved', 'admin_rejected'].includes(status)) {
      throw new Error('Select a valid admin transfer decision.')
    }

    const request = await db.memberTransferRequest.findUnique({
      include: {
        member: true
      },
      where: {
        id: requestId
      }
    })

    if (!request) {
      throw new Error('Member transfer request not found.')
    }

    if (request.status !== 'receiving_sponsor_approved') {
      throw new Error('This transfer is not ready for admin review.')
    }

    if (status === 'admin_rejected') {
      await db.memberTransferRequest.update({
        data: {
          adminReviewedAt: new Date(),
          adminReviewedBy: user.id,
          rejectionReason: rejectionReason || 'SAGICAM admin rejected this transfer request.',
          status
        },
        where: {
          id: request.id
        }
      })

      revalidateMemberTransferViews()

      return { message: 'Member transfer rejected by admin.' }
    }

    const receivingSponsor = await db.profile.findFirst({
      select: {
        clerkId: true,
        sponsorCode: true
      },
      where: {
        clerkId: request.receivingClerkId,
        sponsorCode: request.receivingSponsorCode
      }
    })

    if (!receivingSponsor) {
      throw new Error('Receiving sponsor profile is no longer available.')
    }

    if (
      request.member.clerkId !== request.initiatingClerkId ||
      request.member.sponsorCode !== request.initiatingSponsorCode
    ) {
      throw new Error('This loved one no longer belongs to the current sponsor.')
    }

    const nextMemberMatriculationNumber = getTransferredMemberMatriculationNumber({
      initiatingSponsorCode: request.initiatingSponsorCode,
      memberMatriculationNumber: request.member.memberMatriculationNumber,
      receivingSponsorCode: receivingSponsor.sponsorCode
    })

    await db.$transaction([
      db.member.update({
        data: {
          clerkId: receivingSponsor.clerkId,
          memberMatriculationNumber: nextMemberMatriculationNumber,
          sponsorCode: receivingSponsor.sponsorCode
        },
        where: {
          id: request.memberId
        }
      }),
      db.sponsorRegistrationUsage.updateMany({
        data: {
          memberMatriculationNumber: nextMemberMatriculationNumber,
          sponsorCode: receivingSponsor.sponsorCode
        },
        where: {
          memberMatriculationNumber: request.member.memberMatriculationNumber
        }
      }),
      db.sponsorContributionCredit.updateMany({
        data: {
          memberMatriculationNumber: nextMemberMatriculationNumber,
          sponsorCode: receivingSponsor.sponsorCode
        },
        where: {
          memberMatriculationNumber: request.member.memberMatriculationNumber
        }
      }),
      db.memberTransferRequest.update({
        data: {
          adminReviewedAt: new Date(),
          adminReviewedBy: user.id,
          memberMatriculationNumber: nextMemberMatriculationNumber,
          rejectionReason: null,
          status
        },
        where: {
          id: request.id
        }
      })
    ])

    revalidateMemberPaymentViews()
    revalidateMemberTransferViews()

    return { message: 'Member transfer approved and completed.' }
  } catch (error) {
    return renderError(error)
  }
}

export const createRemovedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    const member = await db.member.findFirst({
      where: {
        id: memberId,
        clerkId: user.id
      }
    })

    if (!member) throw new Error('Loved one not found.')

    const sponsor = await fetchSponsorByCode(member.sponsorCode)

    await db.$transaction(async tx => {
      await tx.removedMember.create({
        data: {
          clerkId: member.clerkId,
          countryOfBirth: member.countryOfBirth,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          sponsorCode: member.sponsorCode
        }
      })

      await tx.member.delete({
        where: {
          id: member.id
        }
      })
    })

    await sendLovedOneRemovalConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: member.firstName,
      lovedOneLastAndMiddleNames: member.lastAndMiddleNames,
      dateOfBirth: member.dateOfBirth,
      sponsorCode: member.sponsorCode,
      memberMatriculationNumber: member.memberMatriculationNumber,
      reasonForLeaving: validatedFields.reasonForLeaving
    })
    revalidateMemberPaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const createRemovedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    if (!member) throw new Error('Loved one not found.')

    const sponsor = await fetchSponsorByCode(member.sponsorCode)

    await db.$transaction(async tx => {
      await tx.removedMember.create({
        data: {
          clerkId: member.clerkId,
          countryOfBirth: member.countryOfBirth,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberId: member.id,
          reasonForLeaving: validatedFields.reasonForLeaving,
          sponsorCode: member.sponsorCode
        }
      })

      await tx.member.delete({
        where: {
          id: member.id
        }
      })
    })

    await sendLovedOneRemovalConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: member.firstName,
      lovedOneLastAndMiddleNames: member.lastAndMiddleNames,
      dateOfBirth: member.dateOfBirth,
      sponsorCode: member.sponsorCode,
      memberMatriculationNumber: member.memberMatriculationNumber,
      reasonForLeaving: validatedFields.reasonForLeaving
    })
    revalidateMemberPaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-members')
}

export const removeOverduePendingMembersAction = async (): Promise<{ message: string }> => {
  await assertAdminUser()

  try {
    const overdueCutoff = getOverdueRegistrationPaymentCreatedAtCutoff()

    const overdueMembers = await db.member.findMany({
      where: {
        createdAt: {
          lt: overdueCutoff
        },
        memberStatus: memberStatus.Pending
      }
    })

    if (overdueMembers.length === 0) {
      return { message: 'No overdue pending members were found.' }
    }

    const overdueMemberIds = overdueMembers.map(member => member.id)
    const overdueMemberMatriculationNumbers = overdueMembers.map(member => member.memberMatriculationNumber)

    await db.$transaction(async tx => {
      await tx.removedMember.createMany({
        data: overdueMembers.map(member => ({
          clerkId: member.clerkId,
          countryOfBirth: member.countryOfBirth,
          dateOfBirth: member.dateOfBirth,
          delegateRecommendation: member.delegateRecommendation,
          firstName: member.firstName,
          lastAndMiddleNames: member.lastAndMiddleNames,
          memberMatriculationNumber: member.memberMatriculationNumber,
          memberStatus: member.memberStatus,
          nameOfBeneficiary: member.nameOfBeneficiary,
          originalMemberCreatedAt: member.createdAt,
          originalMemberId: member.id,
          reasonForLeaving: reasonForLeaving.NoReason,
          sponsorCode: member.sponsorCode
        }))
      })

      await tx.sponsorRegistrationUsage.deleteMany({
        where: {
          memberMatriculationNumber: {
            in: overdueMemberMatriculationNumbers
          }
        }
      })

      await tx.member.deleteMany({
        where: {
          id: {
            in: overdueMemberIds
          }
        }
      })
    })

    revalidateMemberPaymentViews()

    return {
      message: `${overdueMembers.length} overdue pending member${overdueMembers.length === 1 ? '' : 's'} moved to Removed Members.`
    }
  } catch (error) {
    return renderError(error)
  }
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
  await getAuthUser()

  const removedMembers = await db.removedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return removedMembers
}

export const restoreRemovedMemberAction = async (prevState: { removedMemberId: string }) => {
  const user = await getAuthUser()
  const { removedMemberId } = prevState

  try {
    const removedMember = await db.removedMember.findUnique({
      where: {
        id: removedMemberId
      }
    })

    if (!removedMember) throw new Error('Removed loved one not found.')

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && removedMember.clerkId !== user.id) {
      throw new Error('You can only restore loved ones removed from your own account.')
    }

    if (!isWithinMemberRemovalRestoreWindow(removedMember.createdAt)) {
      throw new Error('This loved one can no longer be restored because the 48-hour reversal window has expired.')
    }

    if (!removedMember.nameOfBeneficiary || !removedMember.delegateRecommendation || !removedMember.memberStatus) {
      throw new Error('This removed loved one record is missing the original details needed for restoration.')
    }

    await db.$transaction([
      db.member.create({
        data: {
          ...(removedMember.originalMemberId ? { id: removedMember.originalMemberId } : {}),
          clerkId: removedMember.clerkId,
          countryOfBirth: removedMember.countryOfBirth,
          dateOfBirth: removedMember.dateOfBirth,
          delegateRecommendation: removedMember.delegateRecommendation,
          firstName: removedMember.firstName,
          lastAndMiddleNames: removedMember.lastAndMiddleNames,
          memberMatriculationNumber: removedMember.memberMatriculationNumber,
          memberStatus: removedMember.memberStatus,
          nameOfBeneficiary: removedMember.nameOfBeneficiary,
          sponsorCode: removedMember.sponsorCode,
          ...(removedMember.originalMemberCreatedAt ? { createdAt: removedMember.originalMemberCreatedAt } : {})
        }
      }),
      db.removedMember.delete({
        where: {
          id: removedMember.id
        }
      })
    ])

    if (removedMember.memberStatus === memberStatus.Pending) {
      await createPendingRegistrationUsage({
        memberMatriculationNumber: removedMember.memberMatriculationNumber,
        sponsorCode: removedMember.sponsorCode
      })
    }

    revalidateMemberPaymentViews()

    return { message: 'Loved one restored successfully' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'This loved one already exists in All Members and cannot be restored again.' }
    }

    return renderError(error)
  }
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

    if (!member) {
      throw new Error('Loved one not found.')
    }

    if (member.memberStatus !== memberStatus.Vested) {
      throw new Error('Death announcement is only allowed for vested loved ones.')
    }

    const sponsor = await fetchSponsorByCode(member.sponsorCode)

    await db.deceasedMember.create({
      data: {
        clerkId: member.clerkId,
        contributionStatus: validatedFields.contributionStatus,
        countryOfBirth: member.countryOfBirth,
        dateOfBirth: member.dateOfBirth,
        dateOfDeath: validatedFields.dateOfDeath,
        delegateRecommendation: member.delegateRecommendation,
        firstName: member.firstName,
        lastAndMiddleNames: member.lastAndMiddleNames,
        memberMatriculationNumber: member.memberMatriculationNumber,
        memberStatus: member.memberStatus,
        nameOfBeneficiary: member.nameOfBeneficiary,
        originalMemberCreatedAt: member.createdAt,
        originalMemberId: member.id,
        placeOfDeath: validatedFields.placeOfDeath,
        registrationDate: formatRegistrationDate(member.createdAt),
        sponsorCode: member.sponsorCode
      }
    })
    await db.member.delete({
      where: {
        id: member.id
      }
    })

    await addDeceasedMemberContributionUsage(member.sponsorCode)

    await sendDeathAnnouncementConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: member.firstName,
      lovedOneLastAndMiddleNames: member.lastAndMiddleNames,
      dateOfDeath: validatedFields.dateOfDeath,
      placeOfDeath: validatedFields.placeOfDeath,
      sponsorCode: member.sponsorCode,
      memberMatriculationNumber: member.memberMatriculationNumber,
      contributionStatus: validatedFields.contributionStatus
    })
    revalidateMemberPaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/all-members')
}

export const createDeceasedMemberActionAdmin = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await assertAdminUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(DeceasedMemberSchema, rawData)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      }
    })

    if (!member) {
      throw new Error('Loved one not found.')
    }

    if (member.memberStatus !== memberStatus.Vested) {
      throw new Error('Death announcement is only allowed for vested loved ones.')
    }

    const sponsor = await fetchSponsorByCode(member.sponsorCode)

    await db.deceasedMember.create({
      data: {
        clerkId: member.clerkId,
        contributionStatus: validatedFields.contributionStatus,
        countryOfBirth: member.countryOfBirth,
        dateOfBirth: member.dateOfBirth,
        dateOfDeath: validatedFields.dateOfDeath,
        delegateRecommendation: member.delegateRecommendation,
        firstName: member.firstName,
        lastAndMiddleNames: member.lastAndMiddleNames,
        memberMatriculationNumber: member.memberMatriculationNumber,
        memberStatus: member.memberStatus,
        nameOfBeneficiary: member.nameOfBeneficiary,
        originalMemberCreatedAt: member.createdAt,
        originalMemberId: member.id,
        placeOfDeath: validatedFields.placeOfDeath,
        registrationDate: formatRegistrationDate(member.createdAt),
        sponsorCode: member.sponsorCode
      }
    })
    await db.member.delete({
      where: {
        id: member.id
      }
    })

    await addDeceasedMemberContributionUsage(member.sponsorCode)

    await sendDeathAnnouncementConfirmationEmail({
      sponsorEmail: sponsor.sponsorEmail,
      sponsorFirstName: sponsor.sponsorFirstName,
      lovedOneFirstName: member.firstName,
      lovedOneLastAndMiddleNames: member.lastAndMiddleNames,
      dateOfDeath: validatedFields.dateOfDeath,
      placeOfDeath: validatedFields.placeOfDeath,
      sponsorCode: member.sponsorCode,
      memberMatriculationNumber: member.memberMatriculationNumber,
      contributionStatus: validatedFields.contributionStatus
    })
    revalidateMemberPaymentViews()
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-members')
}

export const fetchDeceasedMembersAction = async () => {
  const user = await getAuthUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

export const fetchDeceasedMembersActionAdmin = async () => {
  await assertAdminUser()

  const deceasedMember = await db.deceasedMember.findMany({
    where: {
      // clerkId: user.id
    },
    orderBy: { createdAt: 'desc' }
  })

  return deceasedMember
}

const fetchDeathDocumentationCases = async (where: Prisma.DeceasedMemberWhereInput = {}) => {
  return db.deceasedMember.findMany({
    include: {
      documents: {
        orderBy: { updatedAt: 'desc' },
        select: {
          clerkId: true,
          createdAt: true,
          deceasedMemberId: true,
          documentType: true,
          fileName: true,
          fileSize: true,
          id: true,
          mimeType: true,
          rejectionReason: true,
          sponsorCode: true,
          status: true,
          updatedAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    where
  })
}

export const fetchSponsorDeathDocumentationCasesAction = async () => {
  const user = await getAuthUser()

  const deceasedMembers = await fetchDeathDocumentationCases({
    clerkId: user.id
  })

  return { deceasedMembers }
}

export const fetchAdminDeathDocumentationCasesAction = async () => {
  await assertAdminUser()

  const deceasedMembers = await fetchDeathDocumentationCases()

  return { deceasedMembers }
}

export const uploadDeceasedMemberDocumentAction = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const deceasedMemberId = getRequiredFormValue(formData, 'deceasedMemberId')
    const documentType = getRequiredFormValue(formData, 'documentType')
    const file = formData.get('documentFile')

    if (!isDeceasedMemberDocumentType(documentType)) {
      throw new Error('Select a valid document type.')
    }

    if (!(file instanceof File) || file.size <= 0) {
      throw new Error(`Please choose a file for ${deceasedMemberDocumentLabels[documentType]}.`)
    }

    if (file.size > maxDocumentationFileSize) {
      throw new Error('The file is too large. Please upload a file that is 20 MB or smaller.')
    }

    if (!isAllowedDeceasedMemberDocumentFile(file)) {
      throw new Error('Please upload a PDF, JPG, PNG, WEBP, HEIC, or HEIF file.')
    }

    const deceasedMember = await db.deceasedMember.findUnique({
      select: {
        clerkId: true,
        id: true,
        sponsorCode: true
      },
      where: {
        id: deceasedMemberId
      }
    })

    if (!deceasedMember) {
      throw new Error('Death announcement not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && deceasedMember.clerkId !== user.id) {
      throw new Error('You can only upload documents for death announcements from your own account.')
    }

    const safeFileName = getSafeDocumentFileName(file, documentType)

    const existingDocument = await db.deceasedMemberDocument.findUnique({
      select: {
        cloudinaryDeliveryType: true,
        cloudinaryFormat: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        cloudinaryVersion: true,
        secureUrl: true
      },
      where: {
        deceasedMemberId_documentType: {
          deceasedMemberId,
          documentType
        }
      }
    })

    const uploadedDocument = await uploadDeathDocumentationToCloudinary({
      buffer: Buffer.from(await file.arrayBuffer()),
      deceasedMemberId,
      documentType,
      fileName: safeFileName,
      sponsorCode: deceasedMember.sponsorCode
    })

    await db.deceasedMemberDocument.upsert({
      create: {
        clerkId: deceasedMember.clerkId,
        cloudinaryDeliveryType: uploadedDocument.deliveryType,
        cloudinaryFormat: uploadedDocument.format,
        cloudinaryPublicId: uploadedDocument.publicId,
        cloudinaryResourceType: uploadedDocument.resourceType,
        cloudinaryVersion: uploadedDocument.version,
        deceasedMemberId,
        documentType,
        fileData: null,
        fileName: safeFileName,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        secureUrl: uploadedDocument.secureUrl,
        sponsorCode: deceasedMember.sponsorCode
      },
      update: {
        clerkId: deceasedMember.clerkId,
        cloudinaryDeliveryType: uploadedDocument.deliveryType,
        cloudinaryFormat: uploadedDocument.format,
        cloudinaryPublicId: uploadedDocument.publicId,
        cloudinaryResourceType: uploadedDocument.resourceType,
        cloudinaryVersion: uploadedDocument.version,
        fileData: null,
        fileName: safeFileName,
        fileSize: file.size,
        mimeType: file.type || 'application/octet-stream',
        rejectionReason: null,
        secureUrl: uploadedDocument.secureUrl,
        sponsorCode: deceasedMember.sponsorCode,
        status: 'submitted'
      },
      where: {
        deceasedMemberId_documentType: {
          deceasedMemberId,
          documentType
        }
      }
    })

    const previousDocument = getStoredCloudinaryDocument(existingDocument)

    if (previousDocument && !isSameCloudinaryDocument(previousDocument, uploadedDocument)) {
      await deleteStoredCloudinaryDocument(existingDocument)
    }

    revalidateDeathDocumentationViews()

    return { message: `${deceasedMemberDocumentLabels[documentType]} uploaded successfully` }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteDeceasedMemberDocumentAction = async (prevState: { documentId: string }) => {
  const user = await getAuthUser()
  const { documentId } = prevState

  try {
    const document = await db.deceasedMemberDocument.findUnique({
      select: {
        clerkId: true,
        cloudinaryDeliveryType: true,
        cloudinaryFormat: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        cloudinaryVersion: true,
        id: true
      },
      where: {
        id: documentId
      }
    })

    if (!document) {
      throw new Error('Document not found.')
    }

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && document.clerkId !== user.id) {
      throw new Error('You can only remove documents from your own account.')
    }

    await db.deceasedMemberDocument.delete({
      where: {
        id: document.id
      }
    })

    await deleteStoredCloudinaryDocument(document)

    revalidateDeathDocumentationViews()

    return { message: 'Document removed successfully' }
  } catch (error) {
    return renderError(error)
  }
}

export const reviewDeceasedMemberDocumentAction = async (
  provState: any,
  formData: FormData
): Promise<{ message: string }> => {
  await assertAdminUser()

  try {
    const documentId = getRequiredFormValue(formData, 'documentId')
    const status = getRequiredFormValue(formData, 'status')
    const rejectionReason = String(formData.get('rejectionReason') ?? '').trim()

    if (!isDeceasedMemberDocumentStatus(status)) {
      throw new Error('Select a valid document review status.')
    }

    await db.deceasedMemberDocument.update({
      data: {
        rejectionReason:
          status === 'rejected' ? rejectionReason || 'Please upload a clearer or corrected document.' : null,
        status
      },
      where: {
        id: documentId
      }
    })

    revalidateDeathDocumentationViews()

    return { message: `Document marked ${status}` }
  } catch (error) {
    return renderError(error)
  }
}

export const restoreDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const user = await getAuthUser()
  const { deceasedMemberId } = prevState

  try {
    const deceasedMember = await db.deceasedMember.findUnique({
      where: {
        id: deceasedMemberId
      }
    })

    if (!deceasedMember) throw new Error('Death announcement not found.')

    const isAdminUser = user.id === process.env.ADMIN_USER_ID

    if (!isAdminUser && deceasedMember.clerkId !== user.id) {
      throw new Error('You can only restore death announcements from your own account.')
    }

    if (!isWithinMemberRemovalRestoreWindow(deceasedMember.createdAt)) {
      throw new Error(
        'This death announcement can no longer be restored because the 48-hour reversal window has expired.'
      )
    }

    if (blockedDeceasedRestoreStatuses.has(deceasedMember.contributionStatus)) {
      throw new Error(
        'This death announcement can no longer be restored because the contribution case is already underway.'
      )
    }

    const {
      dateOfBirth,
      delegateRecommendation,
      memberStatus: restoredMemberStatus,
      originalMemberCreatedAt
    } = deceasedMember

    if (!dateOfBirth || !delegateRecommendation || !restoredMemberStatus || !originalMemberCreatedAt) {
      throw new Error('This death announcement is missing the original details needed for restoration.')
    }

    const documentsToDelete = await db.deceasedMemberDocument.findMany({
      select: {
        cloudinaryDeliveryType: true,
        cloudinaryFormat: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        cloudinaryVersion: true,
        secureUrl: true
      },
      where: {
        deceasedMemberId: deceasedMember.id
      }
    })

    await db.$transaction(async tx => {
      await tx.member.create({
        data: {
          ...(deceasedMember.originalMemberId ? { id: deceasedMember.originalMemberId } : {}),
          clerkId: deceasedMember.clerkId,
          countryOfBirth: deceasedMember.countryOfBirth,
          dateOfBirth,
          delegateRecommendation,
          firstName: deceasedMember.firstName,
          lastAndMiddleNames: deceasedMember.lastAndMiddleNames,
          memberMatriculationNumber: deceasedMember.memberMatriculationNumber,
          memberStatus: restoredMemberStatus,
          nameOfBeneficiary: deceasedMember.nameOfBeneficiary,
          sponsorCode: deceasedMember.sponsorCode,
          createdAt: originalMemberCreatedAt
        }
      })

      await tx.deceasedMember.delete({
        where: {
          id: deceasedMember.id
        }
      })

      const contributionUsage = await tx.sponsorContributionUsage.findUnique({
        select: {
          amountUsed: true
        },
        where: {
          sponsorCode: deceasedMember.sponsorCode
        }
      })

      if (contributionUsage) {
        if (Number(contributionUsage.amountUsed ?? 0) <= contributionCreditPerVestedMember) {
          await tx.sponsorContributionUsage.delete({
            where: {
              sponsorCode: deceasedMember.sponsorCode
            }
          })
        } else {
          await tx.sponsorContributionUsage.update({
            data: {
              amountUsed: {
                decrement: contributionCreditPerVestedMember
              }
            },
            where: {
              sponsorCode: deceasedMember.sponsorCode
            }
          })
        }
      }

      if (restoredMemberStatus === memberStatus.Pending) {
        await tx.sponsorRegistrationUsage.upsert({
          create: {
            amountUsed: registrationFeePerEligibleMember,
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber,
            sponsorCode: deceasedMember.sponsorCode
          },
          update: {
            amountUsed: registrationFeePerEligibleMember,
            sponsorCode: deceasedMember.sponsorCode
          },
          where: {
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber
          }
        })
      }

      if (restoredMemberStatus === memberStatus.Vested) {
        await tx.sponsorContributionCredit.upsert({
          create: {
            amountCredited: contributionCreditPerVestedMember,
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber,
            sponsorCode: deceasedMember.sponsorCode
          },
          update: {
            amountCredited: contributionCreditPerVestedMember,
            sponsorCode: deceasedMember.sponsorCode
          },
          where: {
            memberMatriculationNumber: deceasedMember.memberMatriculationNumber
          }
        })
      }
    })

    await deleteStoredCloudinaryDocuments(documentsToDelete)

    revalidateMemberPaymentViews()

    return { message: 'Death announcement restored successfully' }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { message: 'This loved one already exists in All Members and cannot be restored again.' }
    }

    return renderError(error)
  }
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
    revalidateMemberPaymentViews()

    return { message: 'deleted member removed ' }
  } catch (error) {
    return renderError(error)
  }
}

export const deleteDeceasedMemberAction = async (prevState: { deceasedMemberId: string }) => {
  const { deceasedMemberId } = prevState

  await assertAdminUser()

  try {
    const documentsToDelete = await db.deceasedMemberDocument.findMany({
      select: {
        cloudinaryDeliveryType: true,
        cloudinaryFormat: true,
        cloudinaryPublicId: true,
        cloudinaryResourceType: true,
        cloudinaryVersion: true,
        secureUrl: true
      },
      where: {
        deceasedMemberId
      }
    })

    await db.deceasedMember.delete({
      where: {
        id: deceasedMemberId
      }
    })

    await deleteStoredCloudinaryDocuments(documentsToDelete)

    revalidateMemberPaymentViews()

    return { message: 'deceased member removed ' }
  } catch (error) {
    return renderError(error)
  }
}

export const fetchSingleDeceasedMemberDetails = async (deceasedMemberId: string) => {
  await assertAdminUser()

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
  await assertAdminUser()

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
    revalidateMemberPaymentViews()

    // return { message: `case status Updated Successfully` }
  } catch (error) {
    return renderError(error)
  }

  redirect('/admin-deceased')
}
