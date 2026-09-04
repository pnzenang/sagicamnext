import { Prisma } from '@/generated/prisma/client'

import db from '@/utils/db'
import {
  contributionBalanceAdjustmentType,
  fetchCurrentContributionPaymentTotalsByCode,
  fetchLatestContributionAssessment,
  getContributionReserveDeficitBalance
} from '@/utils/sagicam-contribution-summary'
import { sponsorPaymentLedgerEventTypes, sponsorPaymentTypes } from '@/utils/sagicam-payment-ledger'
import { memberStatus } from '@/utils/types'

export type AdminContributionPaymentUpdateRow = {
  amountSent: number
  amountVerified: number
  balance: number
  contributionDue: number
  sponsorCode: string
  sponsorName: string
  vestedMembers: number
}

type ContributionVerifiedLedgerTotal = {
  amountVerified: unknown
  sponsorCode: string
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)
const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getSponsorName = (profile: { sponsorFirstName: string; sponsorLastAndMiddleName: string } | undefined) => {
  if (!profile) return ''

  return `${profile.sponsorFirstName} ${profile.sponsorLastAndMiddleName}`.trim()
}

const fetchContributionVerifiedLedgerTotalsByCode = async (sponsorCodes: string[]) => {
  if (sponsorCodes.length === 0) return new Map<string, number>()

  const totals = await db.$queryRaw<ContributionVerifiedLedgerTotal[]>(Prisma.sql`
    WITH latest_reset AS (
      SELECT "sponsorCode", MAX("createdAt") AS "resetAt"
      FROM "SponsorPaymentLedgerEntry"
      WHERE "paymentType" = ${sponsorPaymentTypes.contribution}
        AND "eventType" = ${sponsorPaymentLedgerEventTypes.reset}
        AND "sponsorCode" IN (${Prisma.join(sponsorCodes)})
      GROUP BY "sponsorCode"
    )
    SELECT ledger."sponsorCode", COALESCE(SUM(ledger."amount"), 0) AS "amountVerified"
    FROM "SponsorPaymentLedgerEntry" ledger
    LEFT JOIN latest_reset
      ON latest_reset."sponsorCode" = ledger."sponsorCode"
    WHERE ledger."paymentType" = ${sponsorPaymentTypes.contribution}
      AND ledger."eventType" = ${sponsorPaymentLedgerEventTypes.verified}
      AND ledger."sponsorCode" IN (${Prisma.join(sponsorCodes)})
      AND (latest_reset."resetAt" IS NULL OR ledger."createdAt" > latest_reset."resetAt")
    GROUP BY ledger."sponsorCode"
  `)

  return new Map(totals.map(total => [total.sponsorCode, roundCurrencyAmount(decimalToNumber(total.amountVerified))]))
}

export const fetchAdminContributionPaymentUpdateRows = async () => {
  const [
    profiles,
    payments,
    latestContributionAssessment,
    contributionAssessmentGroups,
    contributionUsages,
    contributionCredits,
    balanceAdjustments,
    vestedCounts,
    deceasedVestedCounts
  ] = await Promise.all([
    db.profile.findMany({
      orderBy: {
        sponsorCode: 'asc'
      }
    }),
    db.sponsorContributionPayment.findMany({
      orderBy: {
        sponsorCode: 'asc'
      }
    }),
    fetchLatestContributionAssessment(),
    db.contributionAssessmentGroup.findMany({
      distinct: ['sponsorCode'],
      orderBy: {
        sponsorCode: 'asc'
      },
      select: {
        sponsorCode: true
      }
    }),
    db.sponsorContributionUsage.findMany({
      orderBy: {
        sponsorCode: 'asc'
      },
      select: {
        amountUsed: true,
        sponsorCode: true
      }
    }),
    db.sponsorContributionCredit.groupBy({
      _sum: {
        amountCredited: true
      },
      by: ['sponsorCode'],
      orderBy: {
        sponsorCode: 'asc'
      }
    }),
    db.sponsorBalanceAdjustment.findMany({
      orderBy: {
        sponsorCode: 'asc'
      },
      where: {
        balanceType: contributionBalanceAdjustmentType
      }
    }),
    db.member.groupBy({
      _count: {
        _all: true
      },
      by: ['sponsorCode'],
      orderBy: {
        sponsorCode: 'asc'
      },
      where: {
        memberStatus: memberStatus.Vested
      }
    }),
    db.deceasedMember.groupBy({
      _count: {
        _all: true
      },
      by: ['sponsorCode'],
      orderBy: {
        sponsorCode: 'asc'
      },
      where: {
        memberStatus: memberStatus.Vested
      }
    })
  ])

  const profilesByCode = new Map(profiles.map(profile => [profile.sponsorCode, profile]))
  const paymentsByCode = new Map(payments.map(payment => [payment.sponsorCode, payment]))

  const latestContributionGroupsByCode = new Map(
    latestContributionAssessment?.groups.map(group => [group.sponsorCode, group]) ?? []
  )

  const balanceAdjustmentsByCode = new Map(
    balanceAdjustments.map(adjustment => [adjustment.sponsorCode, decimalToNumber(adjustment.amount)])
  )

  const contributionUsagesByCode = new Map(
    contributionUsages.map(usage => [usage.sponsorCode, decimalToNumber(usage.amountUsed)])
  )

  const contributionCreditsByCode = new Map(
    contributionCredits.map(credit => [credit.sponsorCode, decimalToNumber(credit._sum.amountCredited)])
  )

  const vestedCountsByCode = new Map(vestedCounts.map(item => [item.sponsorCode, item._count._all]))
  const deceasedVestedCountsByCode = new Map(deceasedVestedCounts.map(item => [item.sponsorCode, item._count._all]))

  const sponsorCodes = Array.from(
    new Set([
      ...profilesByCode.keys(),
      ...paymentsByCode.keys(),
      ...(latestContributionAssessment?.groups.map(group => group.sponsorCode) ?? []),
      ...contributionAssessmentGroups.map(group => group.sponsorCode),
      ...contributionUsages.map(usage => usage.sponsorCode),
      ...contributionCredits.map(credit => credit.sponsorCode),
      ...balanceAdjustments.map(adjustment => adjustment.sponsorCode),
      ...vestedCountsByCode.keys(),
      ...deceasedVestedCountsByCode.keys()
    ])
  ).sort((firstCode, secondCode) =>
    firstCode.localeCompare(secondCode, undefined, {
      numeric: true,
      sensitivity: 'base'
    })
  )

  const [verifiedLedgerTotalsByCode, currentContributionPaymentTotalsByCode] = await Promise.all([
    fetchContributionVerifiedLedgerTotalsByCode(sponsorCodes),
    fetchCurrentContributionPaymentTotalsByCode(sponsorCodes)
  ])

  const amountPerVestedMember = decimalToNumber(latestContributionAssessment?.amountPerVestedMember)

  return sponsorCodes.map<AdminContributionPaymentUpdateRow>(sponsorCode => {
    const payment = paymentsByCode.get(sponsorCode)
    const profile = profilesByCode.get(sponsorCode)
    const vestedMembers = vestedCountsByCode.get(sponsorCode) ?? 0
    const reserveDeficitAdjustmentMembers = vestedMembers + (deceasedVestedCountsByCode.get(sponsorCode) ?? 0)
    const currentAmountVerified = decimalToNumber(payment?.amountVerified)
    const recordedAmountVerified = verifiedLedgerTotalsByCode.get(sponsorCode) ?? 0
    const totalAmountVerified = roundCurrencyAmount(Math.max(recordedAmountVerified, currentAmountVerified))
    const currentContributionPaymentTotals = currentContributionPaymentTotalsByCode.get(sponsorCode)
    const amountVerified = currentContributionPaymentTotals?.amountVerified ?? 0

    const contributionDue = roundCurrencyAmount(
      latestContributionGroupsByCode.has(sponsorCode)
        ? decimalToNumber(latestContributionGroupsByCode.get(sponsorCode)?.amountOwed)
        : amountPerVestedMember * vestedMembers
    )

    const contributionAmountUsed = roundCurrencyAmount(
      contributionDue + (contributionUsagesByCode.get(sponsorCode) ?? 0)
    )

    const amountSent = roundCurrencyAmount(
      Math.max((currentContributionPaymentTotals?.amountSent ?? 0) - amountVerified, 0)
    )

    const manualBalanceAdjustment = balanceAdjustmentsByCode.get(sponsorCode) ?? 0
    const sponsorName = getSponsorName(profile) || sponsorCode
    const vestedContributionCredit = contributionCreditsByCode.get(sponsorCode) ?? 0

    return {
      amountSent,
      amountVerified,
      balance: getContributionReserveDeficitBalance({
        amountUsed: contributionAmountUsed,
        amountVerified: totalAmountVerified,
        manualBalanceAdjustment,
        vestedContributionCredit,
        vestedMembersCount: reserveDeficitAdjustmentMembers
      }),
      contributionDue,
      sponsorCode,
      sponsorName,
      vestedMembers
    }
  })
}
