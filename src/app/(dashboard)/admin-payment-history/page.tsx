import { unstable_noStore as noStore } from 'next/cache'

import db from '@/utils/db'
import { sponsorPaymentLedgerEventTypes, sponsorPaymentTypes } from '@/utils/sagicam-payment-ledger'
import AdminPaymentHistoryTable, {
  type AdminPaymentHistoryRow,
  type AdminPaymentHistoryTotals
} from './AdminPaymentHistoryTable'

const paymentTypeLabels: Record<string, string> = {
  [sponsorPaymentTypes.contribution]: 'Contribution',
  [sponsorPaymentTypes.registration]: 'Registration'
}

const eventTypeLabels: Record<string, string> = {
  [sponsorPaymentLedgerEventTypes.manualAdjustment]: 'Amount adjusted',
  [sponsorPaymentLedgerEventTypes.reset]: 'Reset',
  [sponsorPaymentLedgerEventTypes.submitted]: 'Amount set by sponsor',
  [sponsorPaymentLedgerEventTypes.verified]: 'Amount verified'
}

const historyEventTypes = [
  sponsorPaymentLedgerEventTypes.manualAdjustment,
  sponsorPaymentLedgerEventTypes.reset,
  sponsorPaymentLedgerEventTypes.submitted,
  sponsorPaymentLedgerEventTypes.verified
]

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'America/New_York'
})

const decimalToNumber = (value: unknown) => Number(value ?? 0)

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const isManualAmountSentAdjustment = (eventType: string, note?: string | null) =>
  eventType === sponsorPaymentLedgerEventTypes.submitted && note?.toLowerCase().includes('manually adjusted by sagicam')

const AdminPaymentHistory = async () => {
  noStore()

  const ledgerEntries = await db.sponsorPaymentLedgerEntry.findMany({
    orderBy: {
      createdAt: 'desc'
    },
    where: {
      eventType: {
        in: historyEventTypes
      }
    }
  })

  const sponsorCodes = Array.from(new Set(ledgerEntries.map(entry => entry.sponsorCode)))

  const sponsors = await db.profile.findMany({
    select: {
      sponsorCode: true,
      sponsorEmail: true,
      sponsorFirstName: true,
      sponsorLastAndMiddleName: true
    },
    where: {
      sponsorCode: {
        in: sponsorCodes
      }
    }
  })

  const sponsorsByCode = new Map(sponsors.map(sponsor => [sponsor.sponsorCode, sponsor]))

  const rows: AdminPaymentHistoryRow[] = ledgerEntries.map(entry => {
    const sponsor = sponsorsByCode.get(entry.sponsorCode)
    const amount = decimalToNumber(entry.amount)
    const wasManuallyAdjustedAmountSent = isManualAmountSentAdjustment(entry.eventType, entry.note)

    const sponsorName = sponsor ? `${sponsor.sponsorFirstName} ${sponsor.sponsorLastAndMiddleName}`.trim() : ''

    return {
      amountAdjusted:
        entry.eventType === sponsorPaymentLedgerEventTypes.manualAdjustment || wasManuallyAdjustedAmountSent
          ? amount
          : null,
      amountSet:
        entry.eventType === sponsorPaymentLedgerEventTypes.submitted && !wasManuallyAdjustedAmountSent ? amount : null,
      amountVerified: entry.eventType === sponsorPaymentLedgerEventTypes.verified ? amount : null,
      createdAt: entry.createdAt.toISOString(),
      createdAtLabel: dateTimeFormatter.format(entry.createdAt),
      eventType: wasManuallyAdjustedAmountSent
        ? 'Amount adjusted'
        : (eventTypeLabels[entry.eventType] ?? entry.eventType),
      id: entry.id,
      note: entry.note ?? '',
      paymentType: paymentTypeLabels[entry.paymentType] ?? entry.paymentType,
      source:
        entry.eventType === sponsorPaymentLedgerEventTypes.submitted && !wasManuallyAdjustedAmountSent
          ? 'Sponsor'
          : 'SAGICAM',
      sponsorCode: entry.sponsorCode,
      sponsorEmail: sponsor?.sponsorEmail ?? '',
      sponsorName
    }
  })

  const totals: AdminPaymentHistoryTotals = rows.reduce(
    (currentTotals, row) => {
      currentTotals.amountAdjusted = roundCurrencyAmount(currentTotals.amountAdjusted + (row.amountAdjusted ?? 0))
      currentTotals.amountSet = roundCurrencyAmount(currentTotals.amountSet + (row.amountSet ?? 0))
      currentTotals.amountVerified = roundCurrencyAmount(currentTotals.amountVerified + (row.amountVerified ?? 0))
      currentTotals.transactionCount += 1

      return currentTotals
    },
    {
      amountAdjusted: 0,
      amountSet: 0,
      amountVerified: 0,
      transactionCount: 0
    }
  )

  return (
    <div className='max-w-full min-w-0 space-y-6 py-4 sm:py-10'>
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div className='min-w-0'>
          <h1 className='text-4xl font-semibold tracking-normal'>Payment history</h1>
          <p className='text-muted-foreground mt-2 text-sm'>
            All sponsor payment transactions with submitted, adjusted, and SAGICAM verified amounts separated by column.
          </p>
        </div>
      </div>

      <AdminPaymentHistoryTable rows={rows} totals={totals} />
    </div>
  )
}

export default AdminPaymentHistory
