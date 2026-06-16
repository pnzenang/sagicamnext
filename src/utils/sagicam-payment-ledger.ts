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

export type SponsorPaymentLedgerTotals = {
  amountSubmitted: number
  amountVerified: number
}

type FetchSponsorPaymentLedgerEntriesOptions = {
  eventTypes?: SponsorPaymentLedgerEventType[]
  limit?: number
  noStore?: boolean
  paymentType?: SponsorPaymentType
}

type SponsorPaymentAggregate = {
  amountSent: unknown
  amountVerified: unknown
  createdAt: Date
  paymentType: SponsorPaymentType
  sponsorCode: string
  verifiedAt: Date | null
}

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const paymentHistoryEventTypes = [sponsorPaymentLedgerEventTypes.submitted, sponsorPaymentLedgerEventTypes.verified]

const getAggregateSubmittedAmount = (payment: SponsorPaymentAggregate) => {
  if (payment.paymentType === sponsorPaymentTypes.registration) {
    return roundCurrencyAmount(decimalToNumber(payment.amountSent) + decimalToNumber(payment.amountVerified))
  }

  return decimalToNumber(payment.amountSent)
}

const buildLegacyLedgerEntries = (
  entries: SponsorPaymentLedgerEntry[],
  payments: SponsorPaymentAggregate[]
): SponsorPaymentLedgerEntry[] => {
  const entriesByPayment = entries.reduce((groups, entry) => {
    const key = `${entry.sponsorCode}:${entry.paymentType}`

    const currentGroup = groups.get(key) ?? {
      submittedTotal: 0,
      verifiedTotal: 0
    }

    if (entry.eventType === sponsorPaymentLedgerEventTypes.submitted) {
      currentGroup.submittedTotal = roundCurrencyAmount(currentGroup.submittedTotal + entry.amount)
    }

    if (entry.eventType === sponsorPaymentLedgerEventTypes.verified) {
      currentGroup.verifiedTotal = roundCurrencyAmount(currentGroup.verifiedTotal + entry.amount)
    }

    groups.set(key, currentGroup)

    return groups
  }, new Map<string, { submittedTotal: number; verifiedTotal: number }>())

  return payments.flatMap(payment => {
    const key = `${payment.sponsorCode}:${payment.paymentType}`

    const entryTotals = entriesByPayment.get(key) ?? {
      submittedTotal: 0,
      verifiedTotal: 0
    }

    const missingSubmittedAmount = roundCurrencyAmount(
      getAggregateSubmittedAmount(payment) - entryTotals.submittedTotal
    )

    const missingVerifiedAmount = roundCurrencyAmount(
      decimalToNumber(payment.amountVerified) - entryTotals.verifiedTotal
    )

    const legacyEntries: SponsorPaymentLedgerEntry[] = []

    if (missingSubmittedAmount > 0) {
      legacyEntries.push({
        amount: missingSubmittedAmount,
        createdAt: payment.createdAt.toISOString(),
        createdBy: null,
        eventType: sponsorPaymentLedgerEventTypes.submitted,
        id: `legacy-${payment.paymentType}-submitted-${payment.sponsorCode}`,
        note: `${payment.paymentType} payment submitted before payment history was recorded.`,
        paymentType: payment.paymentType,
        sponsorCode: payment.sponsorCode
      })
    }

    if (missingVerifiedAmount > 0 && payment.verifiedAt) {
      legacyEntries.push({
        amount: missingVerifiedAmount,
        createdAt: payment.verifiedAt.toISOString(),
        createdBy: null,
        eventType: sponsorPaymentLedgerEventTypes.verified,
        id: `legacy-${payment.paymentType}-verified-${payment.sponsorCode}`,
        note: `${payment.paymentType} payment verified before payment history was recorded.`,
        paymentType: payment.paymentType,
        sponsorCode: payment.sponsorCode
      })
    }

    return legacyEntries
  })
}

const fetchPaymentAggregates = async (
  sponsorCode: string,
  paymentType?: SponsorPaymentType
): Promise<SponsorPaymentAggregate[]> => {
  const aggregates: SponsorPaymentAggregate[] = []

  if (!paymentType || paymentType === sponsorPaymentTypes.contribution) {
    const payment = await db.sponsorContributionPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    if (payment) {
      aggregates.push({
        amountSent: payment.amountSent,
        amountVerified: payment.amountVerified,
        createdAt: payment.createdAt,
        paymentType: sponsorPaymentTypes.contribution,
        sponsorCode: payment.sponsorCode,
        verifiedAt: payment.verifiedAt
      })
    }
  }

  if (!paymentType || paymentType === sponsorPaymentTypes.registration) {
    const payment = await db.sponsorRegistrationPayment.findUnique({
      where: {
        sponsorCode
      }
    })

    if (payment) {
      aggregates.push({
        amountSent: payment.amountSent,
        amountVerified: payment.amountVerified,
        createdAt: payment.createdAt,
        paymentType: sponsorPaymentTypes.registration,
        sponsorCode: payment.sponsorCode,
        verifiedAt: payment.verifiedAt
      })
    }
  }

  return aggregates
}

export const fetchSponsorPaymentLedgerEntries = async (
  sponsorCode: string,
  {
    eventTypes = paymentHistoryEventTypes,
    limit = 100,
    noStore: shouldNoStore = false,
    paymentType
  }: FetchSponsorPaymentLedgerEntriesOptions = {}
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
      eventType: {
        in: eventTypes
      },
      sponsorCode,
      ...(paymentType ? { paymentType } : {})
    }
  })

  const paymentLedgerEntries = entries.map(entry => ({
    amount: decimalToNumber(entry.amount),
    createdAt: entry.createdAt.toISOString(),
    createdBy: entry.createdBy,
    eventType: entry.eventType as SponsorPaymentLedgerEventType,
    id: entry.id,
    note: entry.note,
    paymentType: entry.paymentType as SponsorPaymentType,
    sponsorCode: entry.sponsorCode
  }))

  const aggregatePayments = await fetchPaymentAggregates(sponsorCode, paymentType)
  const legacyLedgerEntries = buildLegacyLedgerEntries(paymentLedgerEntries, aggregatePayments)

  return [...paymentLedgerEntries, ...legacyLedgerEntries]
    .sort(
      (firstEntry, secondEntry) => new Date(secondEntry.createdAt).getTime() - new Date(firstEntry.createdAt).getTime()
    )
    .slice(0, limit)
}

export const fetchSponsorPaymentLedgerTotals = async (
  sponsorCode: string,
  paymentType: SponsorPaymentType,
  { noStore: shouldNoStore = false }: Pick<FetchSponsorPaymentLedgerEntriesOptions, 'noStore'> = {}
): Promise<SponsorPaymentLedgerTotals> => {
  if (shouldNoStore) {
    noStore()
  }

  const [ledgerTotals, aggregatePayments] = await Promise.all([
    db.sponsorPaymentLedgerEntry.groupBy({
      _sum: {
        amount: true
      },
      by: ['eventType'],
      where: {
        eventType: {
          in: paymentHistoryEventTypes
        },
        paymentType,
        sponsorCode
      }
    }),
    fetchPaymentAggregates(sponsorCode, paymentType)
  ])

  const recordedSubmittedTotal = ledgerTotals.reduce((total, entry) => {
    if (entry.eventType !== sponsorPaymentLedgerEventTypes.submitted) {
      return total
    }

    return roundCurrencyAmount(total + decimalToNumber(entry._sum.amount))
  }, 0)

  const recordedVerifiedTotal = ledgerTotals.reduce((total, entry) => {
    if (entry.eventType !== sponsorPaymentLedgerEventTypes.verified) {
      return total
    }

    return roundCurrencyAmount(total + decimalToNumber(entry._sum.amount))
  }, 0)

  const aggregateSubmittedTotal = roundCurrencyAmount(
    aggregatePayments.reduce((total, payment) => total + getAggregateSubmittedAmount(payment), 0)
  )

  const aggregateVerifiedTotal = roundCurrencyAmount(
    aggregatePayments.reduce((total, payment) => total + decimalToNumber(payment.amountVerified), 0)
  )

  return {
    amountSubmitted: Math.max(recordedSubmittedTotal, aggregateSubmittedTotal),
    amountVerified: Math.max(recordedVerifiedTotal, aggregateVerifiedTotal)
  }
}
