'use server'

import { error } from 'console'

import { auth } from '@clerk/nextjs/server'

import { redirect } from 'next/navigation'

import { revalidatePath, unstable_noStore as noStore } from 'next/cache'
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
import { fetchSponsorContributionSummary } from './sagicam-contribution-summary'
import {
  fetchSponsorRegistrationSummary,
  registrationBalanceAdjustmentType
} from './sagicam-registration-summary'
import { Prisma } from '@/generated/prisma/client'
import prisma from './db'

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

const contributionCreditPerVestedMember = 30
const contributionPaymentAlertType = 'contribution'
const registrationPaymentAlertType = 'registration'

const formatRegistrationDate = (date: Date) => registrationDateFormatter.format(date)

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
  if (previousStatus !== memberStatus.Vested && nextStatus === memberStatus.Vested) {
    await createVestedContributionCredit({ memberMatriculationNumber, sponsorCode })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus === memberStatus.Vested) {
    await updateVestedContributionCredit({ memberMatriculationNumber, previousMatriculationNumber, sponsorCode })

    return
  }

  if (previousStatus === memberStatus.Vested && nextStatus !== memberStatus.Vested) {
    await removeVestedContributionCredit(previousMatriculationNumber)
  }
}

const revalidateMemberPaymentViews = () => {
  revalidatePath('/admin-count')
  revalidatePath('/admin-members')
  revalidatePath('/admin-sagicam-payments')
  revalidatePath('/admin-sagicam-registrations')
  revalidatePath('/all-members')
  revalidatePath('/deceased-members')
  revalidatePath('/removed-members')
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

const getPositiveDollarAmountFromForm = (formData: FormData, fieldName: string) => {
  const amount = getDollarAmountFromForm(formData, fieldName)

  if (amount <= 0) {
    throw new Error('Enter an amount greater than zero.')
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

  return fetchSponsorContributionSummary(profile.sponsorCode, { noStore: true })
}

export const fetchCurrentSponsorRegistrationPayment = async () => {
  const profile = await fetchProfile()

  return fetchSponsorRegistrationSummary(profile.sponsorCode, { noStore: true })
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
    const submittedAt = new Date()

    const payment = await db.sponsorContributionPayment.upsert({
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
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

const addSponsorBalanceAdjustment = async (formData: FormData, balanceType: string): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')
    const amount = getPositiveDollarAmountFromForm(formData, 'balanceAmount')

    await db.sponsorBalanceAdjustment.upsert({
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

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const addSponsorContributionBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addSponsorBalanceAdjustment(formData, contributionBalanceAdjustmentType)
}

export const resetSponsorContributionPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const [totalAssessedContribution, payment, contributionUsage, contributionCredit, balanceAdjustment] =
      await Promise.all([
        db.contributionAssessmentGroup.aggregate({
          _sum: {
            amountOwed: true
          },
          where: {
            sponsorCode
          }
        }),
        db.sponsorContributionPayment.findUnique({
          where: {
            sponsorCode
          }
        }),
        db.sponsorContributionUsage.findUnique({
          where: {
            sponsorCode
          }
        }),
        db.sponsorContributionCredit.aggregate({
          _sum: {
            amountCredited: true
          },
          where: {
            sponsorCode
          }
        }),
        db.sponsorBalanceAdjustment.findUnique({
          where: {
            sponsorCode_balanceType: {
              balanceType: contributionBalanceAdjustmentType,
              sponsorCode
            }
          }
        })
      ])

    const assessedAmount = decimalToNumber(totalAssessedContribution._sum.amountOwed)
    const currentAmountVerified = decimalToNumber(payment?.amountVerified)
    const currentAmountUsed = Number((assessedAmount + decimalToNumber(contributionUsage?.amountUsed)).toFixed(2))
    const currentBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
    const vestedContributionCredit = decimalToNumber(contributionCredit._sum.amountCredited)

    const currentBalance = Number(
      (currentAmountVerified + vestedContributionCredit + currentBalanceAdjustment - currentAmountUsed).toFixed(2)
    )

    const preservedBalanceAdjustment = Number((currentBalance - vestedContributionCredit).toFixed(2))

    await db.$transaction([
      db.sponsorContributionPayment.upsert({
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
      db.sponsorContributionUsage.upsert({
        create: {
          amountUsed: -assessedAmount,
          sponsorCode
        },
        update: {
          amountUsed: -assessedAmount
        },
        where: {
          sponsorCode
        }
      }),
      db.sponsorBalanceAdjustment.upsert({
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
    ])

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
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
    const submittedAt = new Date()

    const payment = await db.sponsorRegistrationPayment.upsert({
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

    revalidatePath('/admin-count')
    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
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
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

export const addSponsorRegistrationBalanceAdjustmentAction = async (formData: FormData): Promise<void> => {
  await addSponsorBalanceAdjustment(formData, registrationBalanceAdjustmentType)
}

export const resetSponsorRegistrationPaymentAction = async (formData: FormData): Promise<void> => {
  await getAuthUser()

  try {
    const sponsorCode = getRequiredFormValue(formData, 'sponsorCode')

    const registrationSummary = await fetchSponsorRegistrationSummary(sponsorCode)
    const preservedBalanceAdjustment = Number((registrationSummary.balance + registrationSummary.amountUsed).toFixed(2))

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
      })
    ])

    revalidatePath('/admin-sagicam-payments')
    revalidatePath('/admin-sagicam-registrations')
    revalidatePath('/all-members')
  } catch (error) {
    renderError(error)
  }
}

const resetPaymentAlert = async (alertType: string) => {
  await getAuthUser()

  await db.paymentAlertReset.upsert({
    create: {
      alertType,
      resetAt: new Date()
    },
    update: {
      resetAt: new Date()
    },
    where: {
      alertType
    }
  })

  revalidatePath('/admin-sagicam-payments')
  revalidatePath('/admin-sagicam-registrations')
}

export const resetContributionPaymentAlertAction = async (_formData: FormData): Promise<void> => {
  await resetPaymentAlert(contributionPaymentAlertType)
}

export const resetRegistrationPaymentAlertAction = async (_formData: FormData): Promise<void> => {
  await resetPaymentAlert(registrationPaymentAlertType)
}

export const resetContributionCalculationAction = async (): Promise<{ message: string }> => {
  await getAuthUser()

  try {
    const latestAssessment = await fetchLatestContributionAssessment()

    if (!latestAssessment) {
      return { message: 'No contribution calculation found to reset.' }
    }

    await db.$transaction([
      ...latestAssessment.groups.map(group =>
        db.sponsorContributionUsage.upsert({
          create: {
            amountUsed: group.amountOwed,
            sponsorCode: group.sponsorCode
          },
          update: {
            amountUsed: {
              increment: group.amountOwed
            }
          },
          where: {
            sponsorCode: group.sponsorCode
          }
        })
      ),
      db.contributionAssessment.delete({
        where: {
          id: latestAssessment.id
        }
      })
    ])

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

export const createRemovedMemberAction = async (provState: any, formData: FormData): Promise<{ message: string }> => {
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)
    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    const member = await db.member.findUnique({
      where: {
        id: memberId,
        clerkId: user.id
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberStatus: member?.memberStatus
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    if (member?.memberStatus === memberStatus.Vested) {
      await removeVestedContributionCredit(member.memberMatriculationNumber)
    }

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
  const user = await getAuthUser()

  try {
    const memberId = formData.get('id') as string
    const rawData = Object.fromEntries(formData)
    const validatedFields = validateWithZodSchema(RemovedMemberSchema, rawData)
    const sponsor = await fetchSponsorByCode(validatedFields.sponsorCode)

    const member = await db.member.findUnique({
      where: {
        id: memberId
      },
      select: {
        memberMatriculationNumber: true,
        memberStatus: true
      }
    })

    await db.removedMember.create({
      data: {
        ...validatedFields,
        clerkId: user.id,
        memberStatus: member?.memberStatus
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    if (member?.memberStatus === memberStatus.Vested) {
      await removeVestedContributionCredit(member.memberMatriculationNumber)
    }

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
    revalidateMemberPaymentViews()
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
        clerkId: user.id,
        memberStatus: member.memberStatus
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    if (member.memberStatus === memberStatus.Vested) {
      await removeVestedContributionCredit(member.memberMatriculationNumber)
    }

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
        clerkId: user.id,
        memberStatus: member.memberStatus
      }
    })
    await db.member.delete({
      where: {
        id: memberId
      }
    })

    if (member.memberStatus === memberStatus.Vested) {
      await removeVestedContributionCredit(member.memberMatriculationNumber)
    }

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
