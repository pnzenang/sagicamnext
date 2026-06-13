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
  manualBalanceAdjustment: number
  sponsorCode: string
  totalAmountUsed: number
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

  const [payment, totalAssessedContribution, contributionUsage, contributionCredit, balanceAdjustment] =
    await Promise.all([
      db.sponsorContributionPayment.findUnique({
        where: {
          sponsorCode
        }
      }),
      db.contributionAssessmentGroup.aggregate({
        _sum: {
          amountOwed: true
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

  const amountOwed = Number((amountPerVestedMember * vestedMembersCount).toFixed(2))
  const amountReceived = decimalToNumber(payment?.amountSent)
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const vestedContributionCredit = decimalToNumber(contributionCredit._sum.amountCredited)

  const totalAmountUsed = Number(
    (
      decimalToNumber(totalAssessedContribution._sum.amountOwed) + decimalToNumber(contributionUsage?.amountUsed)
    ).toFixed(2)
  )

  return {
    amountOwed,
    amountPerVestedMember,
    amountReceived,
    amountVerified,
    balance: Number((amountVerified + vestedContributionCredit + manualBalanceAdjustment - totalAmountUsed).toFixed(2)),
    manualBalanceAdjustment,
    sponsorCode,
    totalAmountUsed,
    vestedContributionCredit,
    vestedMembersCount
  }
}
