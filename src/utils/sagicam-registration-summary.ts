import { unstable_noStore as noStore } from 'next/cache'

import db from './db'

export const registrationBalanceAdjustmentType = 'registration'
export const registrationFeePerEligibleMember = 40

type FetchSponsorRegistrationSummaryOptions = {
  noStore?: boolean
}

export type SponsorRegistrationSummary = {
  amountReceived: number
  amountUsed: number
  amountVerified: number
  balance: number
  balanceDues: number
  lastSubmittedAt: string | null
  manualBalanceAdjustment: number
  pendingMemberAddedAt: string | null
  pendingMemberDueDays: {
    addedAt: string
    amount: number
    memberNames: string[]
  }[]
  pendingMemberNames: string[]
  sponsorCode: string
  verifiedAt: string | null
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

export const fetchRegistrationUsedMemberCount = async (sponsorCode: string) => {
  return db.sponsorRegistrationUsage.count({
    where: {
      sponsorCode
    }
  })
}

export const fetchSponsorRegistrationSummary = async (
  sponsorCode: string,
  options: FetchSponsorRegistrationSummaryOptions = {}
): Promise<SponsorRegistrationSummary> => {
  if (options.noStore) {
    noStore()
  }

  const [payment, registrationUsages, balanceAdjustment] = await Promise.all([
    db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    }),
    db.sponsorRegistrationUsage.findMany({
      select: {
        amountUsed: true,
        memberMatriculationNumber: true
      },
      where: {
        sponsorCode
      }
    }),
    db.sponsorBalanceAdjustment.findUnique({
      where: {
        sponsorCode_balanceType: {
          balanceType: registrationBalanceAdjustmentType,
          sponsorCode
        }
      }
    })
  ])

  const registrationUsageByMemberNumber = new Map(
    registrationUsages.map(usage => [usage.memberMatriculationNumber, decimalToNumber(usage.amountUsed)])
  )

  const memberMatriculationNumbers = Array.from(registrationUsageByMemberNumber.keys())

  const registrationMembers =
    memberMatriculationNumbers.length > 0
      ? await db.member.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            createdAt: true,
            firstName: true,
            lastAndMiddleNames: true,
            memberMatriculationNumber: true
          },
          where: {
            memberMatriculationNumber: {
              in: memberMatriculationNumbers
            },
            sponsorCode
          }
        })
      : []

  const registrationMembersWithAmounts = registrationMembers.map(member => ({
    ...member,
    amountUsed:
      registrationUsageByMemberNumber.get(member.memberMatriculationNumber) ?? registrationFeePerEligibleMember
  }))

  const amountUsed = Number(
    registrationUsages.reduce((total, usage) => total + decimalToNumber(usage.amountUsed), 0).toFixed(2)
  )

  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const amountVerified = decimalToNumber(payment?.amountVerified)
  const pendingMember = registrationMembersWithAmounts[0]

  const pendingMemberDueDaysByDate = registrationMembersWithAmounts.reduce((groups, member) => {
    const dateKey = member.createdAt.toISOString().slice(0, 10)
    const memberName = [member.firstName, member.lastAndMiddleNames].filter(Boolean).join(' ')

    groups.set(dateKey, {
      addedAt: `${dateKey}T12:00:00.000Z`,
      amount: Number(((groups.get(dateKey)?.amount ?? 0) + member.amountUsed).toFixed(2)),
      memberNames: [...(groups.get(dateKey)?.memberNames ?? []), memberName]
    })

    return groups
  }, new Map<string, { addedAt: string; amount: number; memberNames: string[] }>())

  return {
    amountReceived: decimalToNumber(payment?.amountSent),
    amountUsed,
    amountVerified,
    balance: Number((amountVerified + manualBalanceAdjustment - amountUsed).toFixed(2)),
    balanceDues: amountUsed,
    lastSubmittedAt: payment?.lastSubmittedAt?.toISOString() ?? null,
    manualBalanceAdjustment,
    pendingMemberAddedAt: pendingMember?.createdAt.toISOString() ?? null,
    pendingMemberDueDays: Array.from(pendingMemberDueDaysByDate.values()),
    pendingMemberNames: registrationMembersWithAmounts.map(member =>
      [member.firstName, member.lastAndMiddleNames].filter(Boolean).join(' ')
    ),
    sponsorCode,
    verifiedAt: payment?.verifiedAt?.toISOString() ?? null
  }
}
