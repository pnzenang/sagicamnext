import { unstable_noStore as noStore } from 'next/cache'

import type { Prisma } from '@/generated/prisma/client'

import db from './db'
import { contributionReserveDeficitAdjustmentPerVestedMember } from './sagicam-contribution-constants'
import { sponsorPaymentLedgerEventTypes, sponsorPaymentTypes } from './sagicam-payment-ledger'
import { memberStatus } from './types'

export const contributionBalanceAdjustmentType = 'contribution'

type FetchSponsorContributionSummaryOptions = {
  noStore?: boolean
}

export type SponsorContributionSummary = {
  amountOwed: number
  amountPerVestedMember: number
  amountReceived: number
  amountVerified: number
  balance: number
  contributionDueMonths: {
    amount: number
    dueDate: string
  }[]
  dueDate: string | null
  lastSubmittedAt: string | null
  manualBalanceAdjustment: number
  reserveDeficitAdjustmentMembersCount: number
  sponsorCode: string
  totalAmountUsed: number
  verifiedAt: string | null
  vestedContributionCredit: number
  vestedMembersCount: number
}

export type CurrentContributionPaymentTotals = {
  amountSent: number
  amountVerified: number
  lastSubmittedAt: Date | null
  verifiedAt: Date | null
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const currentContributionPaymentEventTypes = [
  sponsorPaymentLedgerEventTypes.submitted,
  sponsorPaymentLedgerEventTypes.verified
]

type ContributionAssessmentPeriodSource = {
  createdAt: Date
  dueDate?: Date | null
}

export const getCurrentContributionAssessmentPeriodRange = (periodDate = new Date()) => {
  const startsAt = new Date(Date.UTC(periodDate.getUTCFullYear(), periodDate.getUTCMonth(), 1))
  const endsAt = new Date(Date.UTC(periodDate.getUTCFullYear(), periodDate.getUTCMonth() + 1, 1))

  return { endsAt, startsAt }
}

export const getCurrentContributionAssessmentWhere = (
  periodDate = new Date()
): Prisma.ContributionAssessmentWhereInput => {
  const { endsAt, startsAt } = getCurrentContributionAssessmentPeriodRange(periodDate)

  return {
    OR: [
      {
        dueDate: {
          gte: startsAt,
          lt: endsAt
        }
      },
      {
        createdAt: {
          gte: startsAt,
          lt: endsAt
        },
        dueDate: null
      }
    ]
  }
}

const getContributionAssessmentPeriodDate = (assessment: ContributionAssessmentPeriodSource) =>
  assessment.dueDate ?? assessment.createdAt

const isCurrentContributionAssessment = (assessment: ContributionAssessmentPeriodSource) => {
  const { endsAt, startsAt } = getCurrentContributionAssessmentPeriodRange()
  const periodDate = getContributionAssessmentPeriodDate(assessment)

  return periodDate >= startsAt && periodDate < endsAt
}

const isDateInContributionPeriod = (date: Date | null | undefined, periodDate = new Date()) => {
  if (!date) return false

  const { endsAt, startsAt } = getCurrentContributionAssessmentPeriodRange(periodDate)

  return date >= startsAt && date < endsAt
}

const getEmptyCurrentContributionPaymentTotals = (): CurrentContributionPaymentTotals => ({
  amountSent: 0,
  amountVerified: 0,
  lastSubmittedAt: null,
  verifiedAt: null
})

export const fetchCurrentContributionPaymentTotalsByCode = async (
  sponsorCodes: string[],
  periodDate = new Date()
) => {
  const normalizedSponsorCodes = Array.from(
    new Set(sponsorCodes.map(sponsorCode => sponsorCode.trim()).filter(Boolean))
  )

  const totalsByCode = new Map(
    normalizedSponsorCodes.map(sponsorCode => [sponsorCode, getEmptyCurrentContributionPaymentTotals()])
  )

  if (normalizedSponsorCodes.length === 0) return totalsByCode

  const { endsAt, startsAt } = getCurrentContributionAssessmentPeriodRange(periodDate)

  const [ledgerEntries, payments] = await Promise.all([
    db.sponsorPaymentLedgerEntry.findMany({
      orderBy: {
        createdAt: 'asc'
      },
      select: {
        amount: true,
        createdAt: true,
        eventType: true,
        sponsorCode: true
      },
      where: {
        createdAt: {
          gte: startsAt,
          lt: endsAt
        },
        eventType: {
          in: currentContributionPaymentEventTypes
        },
        paymentType: sponsorPaymentTypes.contribution,
        sponsorCode: {
          in: normalizedSponsorCodes
        }
      }
    }),
    db.sponsorContributionPayment.findMany({
      select: {
        amountSent: true,
        amountVerified: true,
        lastSubmittedAt: true,
        sponsorCode: true,
        verifiedAt: true
      },
      where: {
        sponsorCode: {
          in: normalizedSponsorCodes
        }
      }
    })
  ])

  const sponsorCodesWithCurrentSubmittedLedger = new Set<string>()
  const sponsorCodesWithCurrentVerifiedLedger = new Set<string>()

  ledgerEntries.forEach(entry => {
    const totals = totalsByCode.get(entry.sponsorCode)

    if (!totals) return

    if (entry.eventType === sponsorPaymentLedgerEventTypes.submitted) {
      sponsorCodesWithCurrentSubmittedLedger.add(entry.sponsorCode)
      totals.amountSent = roundCurrencyAmount(totals.amountSent + decimalToNumber(entry.amount))
      totals.lastSubmittedAt = entry.createdAt
    }

    if (entry.eventType === sponsorPaymentLedgerEventTypes.verified) {
      sponsorCodesWithCurrentVerifiedLedger.add(entry.sponsorCode)
      totals.amountVerified = roundCurrencyAmount(totals.amountVerified + decimalToNumber(entry.amount))
      totals.verifiedAt = entry.createdAt
    }
  })

  payments.forEach(payment => {
    const totals = totalsByCode.get(payment.sponsorCode)

    if (!totals) return

    if (
      !sponsorCodesWithCurrentSubmittedLedger.has(payment.sponsorCode) &&
      isDateInContributionPeriod(payment.lastSubmittedAt, periodDate)
    ) {
      totals.amountSent = decimalToNumber(payment.amountSent)
      totals.lastSubmittedAt = payment.lastSubmittedAt
    }

    if (
      !sponsorCodesWithCurrentVerifiedLedger.has(payment.sponsorCode) &&
      isDateInContributionPeriod(payment.verifiedAt, periodDate)
    ) {
      totals.amountVerified = decimalToNumber(payment.amountVerified)
      totals.verifiedAt = payment.verifiedAt
    }
  })

  return totalsByCode
}

export const getContributionReserveDeficitAdjustment = (vestedMembersCount: number) =>
  roundCurrencyAmount(contributionReserveDeficitAdjustmentPerVestedMember * vestedMembersCount)

export const getContributionReserveDeficitBalance = ({
  amountUsed,
  amountVerified,
  manualBalanceAdjustment,
  vestedContributionCredit = 0,
  vestedMembersCount = 0
}: {
  amountUsed: number
  amountVerified: number
  manualBalanceAdjustment: number
  vestedContributionCredit?: number
  vestedMembersCount?: number
}) =>
  roundCurrencyAmount(
    amountVerified +
      vestedContributionCredit +
      manualBalanceAdjustment +
      getContributionReserveDeficitAdjustment(vestedMembersCount) -
      amountUsed
  )

export const fetchLatestContributionAssessment = () =>
  db.contributionAssessment.findFirst({
    include: {
      groups: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    where: getCurrentContributionAssessmentWhere()
  })

export const fetchSponsorContributionSummary = async (
  sponsorCode: string,
  options: FetchSponsorContributionSummaryOptions = {}
): Promise<SponsorContributionSummary> => {
  if (options.noStore) {
    noStore()
  }

  const normalizedSponsorCode = String(sponsorCode ?? '').trim()

  if (!normalizedSponsorCode) {
    throw new Error('Sponsor code is required to load contribution summary.')
  }

  const latestAssessment = await fetchLatestContributionAssessment()
  const contributionGroup = latestAssessment?.groups.find(group => group.sponsorCode === normalizedSponsorCode)
  const amountPerVestedMember = decimalToNumber(latestAssessment?.amountPerVestedMember)

  const [
    payment,
    contributionAssessmentGroups,
    contributionUsage,
    contributionCredit,
    balanceAdjustment,
    currentVestedMembersCount,
    deceasedVestedMembersCount,
    currentContributionPaymentTotalsByCode
  ] = await Promise.all([
    db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode: normalizedSponsorCode
      }
    }),
    db.contributionAssessmentGroup.findMany({
      include: {
        assessment: {
          select: {
            createdAt: true,
            dueDate: true
          }
        }
      },
      where: {
        sponsorCode: normalizedSponsorCode
      }
    }),
    db.sponsorContributionUsage.findFirst({
      where: {
        sponsorCode: normalizedSponsorCode
      }
    }),
    db.sponsorContributionCredit.aggregate({
      _sum: {
        amountCredited: true
      },
      where: {
        sponsorCode: normalizedSponsorCode
      }
    }),
    db.sponsorBalanceAdjustment.findUnique({
      where: {
        sponsorCode_balanceType: {
          balanceType: contributionBalanceAdjustmentType,
          sponsorCode: normalizedSponsorCode
        }
      }
    }),
    db.member.count({
      where: {
        memberStatus: memberStatus.Vested,
        sponsorCode: normalizedSponsorCode
      }
    }),
    db.deceasedMember.count({
      where: {
        memberStatus: memberStatus.Vested,
        sponsorCode: normalizedSponsorCode
      }
    }),
    fetchCurrentContributionPaymentTotalsByCode([normalizedSponsorCode])
  ])

  const vestedMembersCount = currentVestedMembersCount
  const reserveDeficitAdjustmentMembersCount = vestedMembersCount + deceasedVestedMembersCount

  const currentContributionPaymentTotals =
    currentContributionPaymentTotalsByCode.get(normalizedSponsorCode) ?? getEmptyCurrentContributionPaymentTotals()

  const amountOwed = contributionGroup
    ? decimalToNumber(contributionGroup.amountOwed)
    : Number((amountPerVestedMember * vestedMembersCount).toFixed(2))

  const amountReceived = currentContributionPaymentTotals.amountSent
  const amountVerified = currentContributionPaymentTotals.amountVerified
  const totalAmountVerified = decimalToNumber(payment?.amountVerified)
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const vestedContributionCredit = decimalToNumber(contributionCredit._sum.amountCredited)

  const totalAssessedContribution = contributionAssessmentGroups.reduce(
    (total, group) => Number((total + decimalToNumber(group.amountOwed)).toFixed(2)),
    0
  )

  const totalAmountUsed = Number(
    (totalAssessedContribution + decimalToNumber(contributionUsage?.amountUsed)).toFixed(2)
  )

  const currentContributionAssessmentGroups = contributionAssessmentGroups.filter(group =>
    isCurrentContributionAssessment(group.assessment)
  )

  const contributionDueMonthsByDate = currentContributionAssessmentGroups.reduce((groups, group) => {
    const dueDate = group.assessment.dueDate ?? group.assessment.createdAt
    const dueDateKey = dueDate.toISOString().slice(0, 7)
    const currentGroup = groups.get(dueDateKey)

    groups.set(dueDateKey, {
      amount: Number(((currentGroup?.amount ?? 0) + decimalToNumber(group.amountOwed)).toFixed(2)),
      dueDate: currentGroup?.dueDate ?? dueDate.toISOString()
    })

    return groups
  }, new Map<string, { amount: number; dueDate: string }>())

  const contributionDueMonths = Array.from(contributionDueMonthsByDate.values()).sort(
    (firstMonth, secondMonth) => new Date(secondMonth.dueDate).getTime() - new Date(firstMonth.dueDate).getTime()
  )

  const fallbackContributionDueMonths =
    contributionDueMonths.length > 0 || amountOwed <= 0 || !(latestAssessment?.dueDate ?? latestAssessment?.createdAt)
      ? contributionDueMonths
      : [
          {
            amount: amountOwed,
            dueDate: (latestAssessment.dueDate ?? latestAssessment.createdAt).toISOString()
          }
        ]

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    balance: getContributionReserveDeficitBalance({
      amountUsed: totalAmountUsed,
      amountVerified: totalAmountVerified,
      manualBalanceAdjustment,
      vestedContributionCredit,
      vestedMembersCount: reserveDeficitAdjustmentMembersCount
    }),
    contributionDueMonths: fallbackContributionDueMonths,
    dueDate: (latestAssessment?.dueDate ?? latestAssessment?.createdAt)?.toISOString() ?? null,
    lastSubmittedAt: currentContributionPaymentTotals.lastSubmittedAt?.toISOString() ?? null,
    manualBalanceAdjustment,
    reserveDeficitAdjustmentMembersCount,
    sponsorCode: normalizedSponsorCode,
    totalAmountUsed,
    verifiedAt: currentContributionPaymentTotals.verifiedAt?.toISOString() ?? null,
    vestedContributionCredit,
    vestedMembersCount
  }
}
