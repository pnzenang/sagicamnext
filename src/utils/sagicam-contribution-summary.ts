import { unstable_noStore as noStore } from 'next/cache'

import db from './db'

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
  sponsorCode: string
  totalAmountUsed: number
  verifiedAt: string | null
  vestedContributionCredit: number
  vestedMembersCount: number
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const fetchLatestContributionAssessment = () =>
  db.contributionAssessment.findFirst({
    include: {
      groups: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

export const fetchSponsorContributionSummary = async (
  sponsorCode: string,
  options: FetchSponsorContributionSummaryOptions = {}
): Promise<SponsorContributionSummary> => {
  if (options.noStore) {
    noStore()
  }

  const latestAssessment = await fetchLatestContributionAssessment()
  const contributionGroup = latestAssessment?.groups.find(group => group.sponsorCode === sponsorCode)
  const amountPerVestedMember = decimalToNumber(latestAssessment?.amountPerVestedMember)
  const vestedMembersCount = contributionGroup?.vestedMembersCount ?? 0

  const [payment, contributionAssessmentGroups, contributionUsage, contributionCredit, balanceAdjustment] =
    await Promise.all([
      db.sponsorContributionPayment.findUnique({
        where: {
          sponsorCode
        }
      }),
      db.contributionAssessmentGroup.findMany({
        include: {
          assessment: {
            select: {
              createdAt: true
            }
          }
        },
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

  const amountOwed = contributionGroup
    ? decimalToNumber(contributionGroup.amountOwed)
    : Number((amountPerVestedMember * vestedMembersCount).toFixed(2))
  const amountReceived = decimalToNumber(payment?.amountSent)
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const vestedContributionCredit = decimalToNumber(contributionCredit._sum.amountCredited)

  const totalAssessedContribution = contributionAssessmentGroups.reduce(
    (total, group) => Number((total + decimalToNumber(group.amountOwed)).toFixed(2)),
    0
  )

  const totalAmountUsed = Number(
    (totalAssessedContribution + decimalToNumber(contributionUsage?.amountUsed)).toFixed(2)
  )

  const contributionDueMonthsByDate = contributionAssessmentGroups.reduce((groups, group) => {
    const dueDate = group.assessment.createdAt
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
    contributionDueMonths.length > 0 || amountOwed <= 0 || !latestAssessment?.createdAt
      ? contributionDueMonths
      : [
          {
            amount: amountOwed,
            dueDate: latestAssessment.createdAt.toISOString()
          }
        ]

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    balance: Number((amountVerified + vestedContributionCredit + manualBalanceAdjustment - totalAmountUsed).toFixed(2)),
    contributionDueMonths: fallbackContributionDueMonths,
    dueDate: latestAssessment?.createdAt.toISOString() ?? null,
    lastSubmittedAt: payment?.lastSubmittedAt?.toISOString() ?? null,
    manualBalanceAdjustment,
    sponsorCode,
    totalAmountUsed,
    verifiedAt: payment?.verifiedAt?.toISOString() ?? null,
    vestedContributionCredit,
    vestedMembersCount
  }
}
