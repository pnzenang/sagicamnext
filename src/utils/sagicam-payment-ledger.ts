import { unstable_noStore as noStore } from 'next/cache'

import db from './db'

export const sponsorPaymentTypes = {
  contribution: 'contribution',
  registration: 'registration'
} as const

export const sponsorPaymentLedgerEventTypes = {
  dueOffset: 'due_offset',
  manualAdjustment: 'manual_adjustment',
  reset: 'reset',
  submitted: 'submitted',
  verified: 'verified'
} as const

export type SponsorPaymentType = (typeof sponsorPaymentTypes)[keyof typeof sponsorPaymentTypes]
export type SponsorPaymentLedgerEventType =
  (typeof sponsorPaymentLedgerEventTypes)[keyof typeof sponsorPaymentLedgerEventTypes]

export type SponsorPaymentLedgerEntry = {
  amount: number
  createdAt: string
  createdBy: string | null
  eventType: SponsorPaymentLedgerEventType
  id: string
  note: string | null
  paymentType: SponsorPaymentType
  sponsorCode: string
}

type FetchSponsorPaymentLedgerEntriesOptions = {
  limit?: number
  noStore?: boolean
  paymentType?: SponsorPaymentType
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

export const fetchSponsorPaymentLedgerEntries = async (
  sponsorCode: string,
  { limit = 100, noStore: shouldNoStore = false, paymentType }: FetchSponsorPaymentLedgerEntriesOptions = {}
): Promise<SponsorPaymentLedgerEntry[]> => {
  if (shouldNoStore) {
    noStore()
  }

  const entries = await db.sponsorPaymentLedgerEntry.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    take: limit,
    where: {
      sponsorCode,
      ...(paymentType ? { paymentType } : {})
    }
  })

  return entries.map(entry => ({
    amount: decimalToNumber(entry.amount),
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy,
    eventType: entry.eventType as SponsorPaymentLedgerEventType,
    id: entry.id,
    note: entry.note,
    paymentType: entry.paymentType as SponsorPaymentType,
    sponsorCode: entry.sponsorCode
  }))
}
