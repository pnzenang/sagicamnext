import { unstable_noStore as noStore } from 'next/cache'

import db from './db'
import { memberStatus } from './types'

export const registrationBalanceAdjustmentType = 'registration'
export const registrationFeePerEligibleMember = 40

const registrationUsedStatuses = [memberStatus.Awaiting, memberStatus.Vested]

type FetchSponsorRegistrationSummaryOptions = {
  noStore?: boolean
}

export type SponsorRegistrationSummary = {
  amountReceived: number
  amountUsed: number
  amountVerified: number
  balance: number
  manualBalanceAdjustment: number
  sponsorCode: string
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

export const fetchRegistrationUsedMemberCount = async (sponsorCode: string) => {
  const [activeMembers, removedMembers, deceasedMembers] = await Promise.all([
    db.member.count({
      where: {
        memberStatus: {
          in: registrationUsedStatuses
        },
        sponsorCode
      }
    }),
    db.removedMember.count({
      where: {
        memberStatus: {
          in: registrationUsedStatuses
        },
        sponsorCode
      }
    }),
    db.deceasedMember.count({
      where: {
        memberStatus: {
          in: registrationUsedStatuses
        },
        sponsorCode
      }
    })
  ])

  return activeMembers + removedMembers + deceasedMembers
}

export const fetchSponsorRegistrationSummary = async (
  sponsorCode: string,
  options: FetchSponsorRegistrationSummaryOptions = {}
): Promise<SponsorRegistrationSummary> => {
  if (options.noStore) {
    noStore()
  }

  const [payment, registrationUsedMemberCount, balanceAdjustment] = await Promise.all([
    db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    }),
    fetchRegistrationUsedMemberCount(sponsorCode),
    db.sponsorBalanceAdjustment.findUnique({
      where: {
        sponsorCode_balanceType: {
          balanceType: registrationBalanceAdjustmentType,
          sponsorCode
        }
      }
    })
  ])

  const amountUsed = registrationUsedMemberCount * registrationFeePerEligibleMember
  const manualBalanceAdjustment = decimalToNumber(balanceAdjustment?.amount)
  const amountVerified = decimalToNumber(payment?.amountVerified)

  return {
    amountReceived: decimalToNumber(payment?.amountSent),
    amountUsed,
    amountVerified,
    balance: Number((amountVerified + manualBalanceAdjustment - amountUsed).toFixed(2)),
    manualBalanceAdjustment,
    sponsorCode
  }
}
