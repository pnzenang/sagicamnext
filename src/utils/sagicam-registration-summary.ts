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
  manualBalanceAdjustment: number
  sponsorCode: string
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

  const [payment, registrationUsage, balanceAdjustment] = await Promise.all([
    db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    }),
    db.sponsorRegistrationUsage.aggregate({
      _sum: {
        amountUsed: true
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

  const amountUsed = decimalToNumber(registrationUsage._sum.amountUsed)
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
