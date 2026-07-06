'use client'

import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, CircleDollarSign } from 'lucide-react'

import SponsorContributionPaymentCard from '@/components/dashboard/SponsorContributionPaymentCard'
import SponsorRegistrationPaymentCard from '@/components/dashboard/SponsorRegistrationPaymentCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { contributionCreditPerVestedMember } from '@/utils/sagicam-contribution-constants'
import type { SponsorPaymentLedgerEntry } from '@/utils/sagicam-payment-ledger'

export type CurrentContributionPayment = {
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

export type CurrentRegistrationPayment = {
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

export const registrationFeePerPendingMember = 40

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long'
})

const monthYearFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long',
  year: 'numeric'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
})

const sagicamPaymentUrl =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'

const sagicamQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'

const getCurrentMonthName = () => monthFormatter.format(new Date())

const formatDate = (date: string) => dateFormatter.format(new Date(date))

const formatDateTime = (date: string) => dateTimeFormatter.format(new Date(date))

const formatCurrency = (amount: number) => currencyFormatter.format(amount)

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

const getContributionBalanceTarget = (vestedMembersCount: number) =>
  roundCurrencyAmount(contributionCreditPerVestedMember * vestedMembersCount)

const shouldShowReplenishAccountNotice = (balance: number, vestedMembersCount: number) =>
  balance > 0 && balance < getContributionBalanceTarget(vestedMembersCount)

const shouldShowNotInGoodStandingNotice = (balance: number) => balance < 0

const getReserveOrDeficitLabel = (balance: number, reserveLabel: string) => (balance < 0 ? 'DEFICIT' : reserveLabel)

const getContributionBalanceTextClassName = (balance: number, vestedMembersCount: number) => {
  if (balance >= getContributionBalanceTarget(vestedMembersCount)) {
    return 'text-green-700 dark:text-green-300'
  }

  if (balance > 0) {
    return 'text-amber-600 dark:text-amber-600'
  }

  return 'text-red-700 dark:text-red-300'
}

const paymentLedgerHistoryEventTypes = {
  submitted: 'submitted',
  verified: 'verified'
} as const

export const getRegistrationPaymentAmount = (pendingMembersCount: number) =>
  pendingMembersCount * registrationFeePerPendingMember

const SummaryRow = ({ label, value }: { label: ReactNode; value: number }) => (
  <div className='text-primary/80 flex items-start justify-between gap-4'>
    <span className='min-w-0 break-words'>{label}</span>
    <span className='shrink-0 text-right tabular-nums'>{formatCurrency(value)}</span>
  </div>
)

const PaymentAmountCard = ({
  amount,
  description,
  footer,
  title
}: {
  amount: number
  description: ReactNode
  footer?: ReactNode
  title: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>
      {title}: {formatCurrency(amount)}
    </p>
    <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{description}</p>
    {footer ? (
      <div className='mt-2 text-sm font-extrabold break-words text-teal-600 dark:text-teal-300'>{footer}</div>
    ) : null}
  </div>
)

const PaymentInstructionsCard = () => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>Payment instructions</p>
    <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
      Send the Zelle payment first, then record the exact amount here for SAGICAM verification.
    </p>
  </div>
)

const PaymentQrCard = () => (
  <Link
    href={sagicamPaymentUrl}
    className='border-primary/20 bg-background flex h-full min-h-60 min-w-0 items-center justify-center rounded-md border p-0 sm:p-1'
  >
    <Image
      src={sagicamQrCodeUrl}
      width={320}
      height={320}
      alt='SAGICAM payment QR code'
      className='h-auto max-h-80 w-full max-w-80'
    />
  </Link>
)

const ContributionSummaryCard = ({
  currentContribution,
  currentMonthName
}: {
  currentContribution: CurrentContributionPayment
  currentMonthName: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>Contribution payment summary</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>
      <SummaryRow label='Amount Sent' value={currentContribution.amountReceived} />
      <SummaryRow label='Amount Verified by SAGICAM' value={currentContribution.amountVerified} />
      <SummaryRow label={`Amount Used for ${currentMonthName}'s Contribution`} value={currentContribution.amountOwed} />
      <SummaryRow label='Total Amount Used for Contributions' value={currentContribution.totalAmountUsed} />
      <SummaryRow label='Vested Loved One Credit' value={currentContribution.vestedContributionCredit} />
    </div>
    <PaymentBalanceRow
      balance={currentContribution.balance}
      contributionVestedMembersCount={currentContribution.vestedMembersCount}
      reserveLabel='Reserve'
    />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts will be verified by SAGICAM and reversed if not accurate.
    </p>
  </div>
)

const RegistrationSummaryCard = ({
  currentRegistrationPayment
}: {
  currentRegistrationPayment: CurrentRegistrationPayment
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>Registration payment summary</p>
    <div className='mt-2 grid gap-1.5 text-sm font-semibold'>
      <SummaryRow label='Amount Sent' value={currentRegistrationPayment.amountReceived} />
      <SummaryRow label='Amount Verified by SAGICAM' value={currentRegistrationPayment.amountVerified} />
      <SummaryRow label='Used for Registration' value={currentRegistrationPayment.amountUsed} />
    </div>
    <PaymentBalanceRow
      balance={currentRegistrationPayment.balance}
      deficitNoticeLabel='Awaiting Registration Fees'
      reserveLabel='Registration Reserve'
    />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts will be verified by SAGICAM and reversed if not accurate.
    </p>
  </div>
)

export const SponsorPaymentSummaryCards = ({
  currentContribution,
  currentRegistrationPayment
}: {
  currentContribution: CurrentContributionPayment
  currentRegistrationPayment: CurrentRegistrationPayment
}) => {
  const currentMonthName = getCurrentMonthName()

  return (
    <div className='grid w-full min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2'>
      <ContributionSummaryCard currentContribution={currentContribution} currentMonthName={currentMonthName} />
      <RegistrationSummaryCard currentRegistrationPayment={currentRegistrationPayment} />
    </div>
  )
}

type PaymentLedgerHistoryCardProps = {
  summaryColumns: PaymentSummaryRow[][]
}

type PaymentDateGroup = {
  amount: number
  id: string
  meta: string
  names?: string[]
}

type PaymentSummaryRow = {
  entries?: {
    amount: number
    id: string
    meta: string
  }[]
  dateGroups?: PaymentDateGroup[]
  id: string
  label: string
  meta?: string
  names?: string[]
  value: number
}

const PaymentSummaryCard = ({ row }: { row: PaymentSummaryRow }) => {
  const hasEntries = row.entries && row.entries.length > 0

  return (
    <div className='border-primary/20 bg-primary/10 text-primary rounded-md border px-3 py-3'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <p className='text-sm font-extrabold tracking-normal break-words uppercase sm:text-base'>{row.label}</p>
          {row.names && row.names.length > 0 ? (
            <div className='mt-1 grid gap-0.5 text-xs leading-snug font-extrabold'>
              {row.names.map((name, index) => (
                <p key={`${name}-${index}`} className='break-words'>
                  {name}
                </p>
              ))}
            </div>
          ) : null}
          {row.dateGroups && row.dateGroups.length > 0 ? (
            <div className='mt-2 grid gap-2 text-xs leading-snug'>
              {row.dateGroups.map(group => {
                const showFor = !group.meta.startsWith('Verified on:')

                return (
                  <div key={group.id} className='min-w-0'>
                    <p className='text-primary/80 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 font-semibold'>
                      <span className='shrink-0 text-xs font-semibold tabular-nums'>
                        {formatCurrency(group.amount)}
                      </span>
                      {showFor ? <span className='text-xs'>for</span> : null}
                      <span className='min-w-0 text-xs break-words'>{group.meta}</span>
                    </p>
                    {group.names && group.names.length > 0 ? (
                      <div className='mt-0.5 grid gap-0.5 font-extrabold'>
                        {group.names.map((name, index) => (
                          <p key={`${group.id}-${name}-${index}`} className='break-words'>
                            {name}
                          </p>
                        ))}
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          ) : null}
          {row.meta ? <p className='text-primary/80 mt-1 text-xs leading-snug font-semibold'>{row.meta}</p> : null}
        </div>
        <p className='shrink-0 text-right text-sm font-extrabold tabular-nums sm:text-base'>
          {formatCurrency(row.value)}
        </p>
      </div>

      {hasEntries ? (
        <div className='mt-3 grid gap-2'>
          {row.entries?.map(entry => (
            <div key={entry.id} className='flex items-start justify-between gap-3'>
              <p className='text-primary/80 min-w-0 text-xs leading-snug font-semibold'>{entry.meta}</p>
              <p className='shrink-0 text-right text-xs font-semibold tabular-nums'>{formatCurrency(entry.amount)}</p>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

const getSubmittedPaymentEntryMeta = (entry: SponsorPaymentLedgerEntry) =>
  entry.note?.toLowerCase().includes('amount sent manually adjusted')
    ? `Found by SAGICAM on: ${formatDateTime(entry.createdAt)}`
    : `Payment submitted ${formatDateTime(entry.createdAt)}`

const getVerifiedPaymentGroupsLinkedToSubmittedPayments = (
  submittedEntries: SponsorPaymentLedgerEntry[],
  amountVerified: number
): PaymentDateGroup[] => {
  let remainingVerifiedAmount = roundCurrencyAmount(amountVerified)
  const verifiedGroupsByDay = new Map<string, number>()

  const sortedSubmittedEntries = submittedEntries
    .filter(entry => entry.amount > 0)
    .sort(
      (firstEntry, secondEntry) => new Date(firstEntry.createdAt).getTime() - new Date(secondEntry.createdAt).getTime()
    )

  sortedSubmittedEntries.forEach(entry => {
    if (remainingVerifiedAmount <= 0) {
      return
    }

    const dayKey = entry.createdAt.slice(0, 10)
    const linkedAmount = roundCurrencyAmount(Math.min(entry.amount, remainingVerifiedAmount))

    remainingVerifiedAmount = roundCurrencyAmount(remainingVerifiedAmount - linkedAmount)
    verifiedGroupsByDay.set(dayKey, roundCurrencyAmount((verifiedGroupsByDay.get(dayKey) ?? 0) + linkedAmount))
  })

  return Array.from(verifiedGroupsByDay.entries())
    .sort(([firstDay], [secondDay]) => secondDay.localeCompare(firstDay))
    .map(([dayKey, amount]) => ({
      amount,
      id: `amount-verified-linked-${dayKey}`,
      meta: `Verified on: ${formatDate(`${dayKey}T12:00:00.000Z`)}`
    }))
}

const PaymentLedgerHistoryCard = ({ summaryColumns }: PaymentLedgerHistoryCardProps) => (
  <div className='border-primary/20 bg-background max-w-full min-w-0 overflow-hidden rounded-md border'>
    <div className='border-b px-4 py-3'>
      <p className='text-lg font-extrabold'>Payment history</p>
      <p className='text-muted-foreground mt-1 text-sm'>
        Dues, amount sent, and SAGICAM verified totals are shown in the cards below.
      </p>
    </div>

    <div className='grid gap-3 p-3 sm:grid-cols-3 sm:p-4'>
      {summaryColumns.map(column => (
        <div key={column.map(row => row.id).join('-')} className='grid h-fit gap-3'>
          {column.map(row => (
            <PaymentSummaryCard key={row.id} row={row} />
          ))}
        </div>
      ))}
    </div>
  </div>
)

const buildAmountSentSummaryRow = ({
  amountSentDate,
  amountSentValue,
  submittedPaymentLedgerEntries
}: {
  amountSentDate?: string | null
  amountSentValue: number
  submittedPaymentLedgerEntries: SponsorPaymentLedgerEntry[]
}): PaymentSummaryRow => {
  const submittedPaymentEntries = submittedPaymentLedgerEntries.map(entry => ({
    amount: entry.amount,
    id: entry.id,
    meta: getSubmittedPaymentEntryMeta(entry)
  }))

  const amountSentSummaryEntries =
    submittedPaymentEntries.length > 0
      ? submittedPaymentEntries
      : amountSentValue > 0 && amountSentDate
        ? [
            {
              amount: amountSentValue,
              id: `amount-sent-${amountSentDate}`,
              meta: `Payment submitted ${formatDateTime(amountSentDate)}`
            }
          ]
        : []

  return {
    entries: amountSentSummaryEntries,
    id: 'amount-sent',
    label: 'Amount Sent',
    meta:
      amountSentSummaryEntries.length > 0 || !amountSentDate
        ? undefined
        : `Payment submitted ${formatDateTime(amountSentDate)}`,
    value: roundCurrencyAmount(amountSentSummaryEntries.reduce((total, entry) => total + entry.amount, 0))
  }
}

const buildAmountVerifiedSummaryRow = ({
  amountVerifiedDate,
  amountVerifiedValue,
  submittedPaymentLedgerEntries,
  verifiedAt
}: {
  amountVerifiedDate?: string | null
  amountVerifiedValue: number
  submittedPaymentLedgerEntries: SponsorPaymentLedgerEntry[]
  verifiedAt?: string | null
}): PaymentSummaryRow => {
  const verifiedPaymentDateGroups = getVerifiedPaymentGroupsLinkedToSubmittedPayments(
    submittedPaymentLedgerEntries,
    amountVerifiedValue
  )

  const linkedVerifiedPaymentTotal = roundCurrencyAmount(
    verifiedPaymentDateGroups.reduce((total, group) => total + group.amount, 0)
  )

  const legacyVerifiedAmount = roundCurrencyAmount(amountVerifiedValue - linkedVerifiedPaymentTotal)

  const legacyVerifiedDateGroup =
    legacyVerifiedAmount > 0 && verifiedAt
      ? {
          amount: legacyVerifiedAmount,
          id: `amount-verified-legacy-${verifiedAt}`,
          meta: `Verified on: ${formatDate(verifiedAt)}`
        }
      : null

  const amountVerifiedDateGroups =
    verifiedPaymentDateGroups.length > 0 || legacyVerifiedDateGroup
      ? [...verifiedPaymentDateGroups, ...(legacyVerifiedDateGroup ? [legacyVerifiedDateGroup] : [])]
      : amountVerifiedValue > 0 && amountVerifiedDate
        ? [
            {
              amount: amountVerifiedValue,
              id: `amount-verified-${amountVerifiedDate}`,
              meta: `Verified on: ${formatDate(amountVerifiedDate)}`
            }
          ]
        : []

  return {
    dateGroups: amountVerifiedDateGroups,
    id: 'amount-verified',
    label: 'Amount Verified by SAGICAM',
    meta:
      amountVerifiedDateGroups.length > 0 || !amountVerifiedDate
        ? undefined
        : `Verified on: ${formatDateTime(amountVerifiedDate)}`,
    value: amountVerifiedValue
  }
}

const buildContributionHistorySummaryColumns = (
  currentContribution: CurrentContributionPayment,
  ledgerEntries: SponsorPaymentLedgerEntry[]
): PaymentSummaryRow[][] => {
  const latestSubmittedPayment = ledgerEntries.find(
    entry => entry.eventType === paymentLedgerHistoryEventTypes.submitted
  )

  const latestVerifiedPayment = ledgerEntries.find(entry => entry.eventType === paymentLedgerHistoryEventTypes.verified)
  const amountSentDate = latestSubmittedPayment?.createdAt ?? currentContribution.lastSubmittedAt
  const amountVerifiedDate = latestVerifiedPayment?.createdAt ?? currentContribution.verifiedAt

  const submittedPaymentLedgerEntries = ledgerEntries.filter(
    entry => entry.eventType === paymentLedgerHistoryEventTypes.submitted
  )

  const contributionDueDateGroups = currentContribution.contributionDueMonths.map(month => ({
    amount: month.amount,
    id: month.dueDate,
    meta: `${monthYearFormatter.format(new Date(month.dueDate))} contribution due ${formatDate(month.dueDate)}`
  }))

  const contributionDueSummaryValue = roundCurrencyAmount(
    contributionDueDateGroups.reduce((total, group) => total + group.amount, 0)
  )

  const dueSummaryRows: PaymentSummaryRow[] = [
    {
      dateGroups: contributionDueDateGroups.length > 0 ? contributionDueDateGroups : undefined,
      id: 'contribution-due',
      label: 'Contribution Due',
      meta:
        contributionDueDateGroups.length > 0
          ? undefined
          : currentContribution.dueDate
            ? `Due ${formatDate(currentContribution.dueDate)}`
            : undefined,
      value: contributionDueDateGroups.length > 0 ? contributionDueSummaryValue : currentContribution.amountOwed
    }
  ]

  return [
    dueSummaryRows,
    [
      buildAmountSentSummaryRow({
        amountSentDate,
        amountSentValue: currentContribution.amountReceived,
        submittedPaymentLedgerEntries
      })
    ],
    [
      buildAmountVerifiedSummaryRow({
        amountVerifiedDate,
        amountVerifiedValue: currentContribution.amountVerified,
        submittedPaymentLedgerEntries,
        verifiedAt: currentContribution.verifiedAt
      })
    ]
  ]
}

const buildRegistrationHistorySummaryColumns = (
  currentRegistrationPayment: CurrentRegistrationPayment,
  ledgerEntries: SponsorPaymentLedgerEntry[]
): PaymentSummaryRow[][] => {
  const latestSubmittedPayment = ledgerEntries.find(
    entry => entry.eventType === paymentLedgerHistoryEventTypes.submitted
  )

  const latestVerifiedPayment = ledgerEntries.find(entry => entry.eventType === paymentLedgerHistoryEventTypes.verified)
  const amountSentDate = latestSubmittedPayment?.createdAt ?? currentRegistrationPayment.lastSubmittedAt
  const amountVerifiedDate = latestVerifiedPayment?.createdAt ?? currentRegistrationPayment.verifiedAt

  const submittedPaymentLedgerEntries = ledgerEntries.filter(
    entry => entry.eventType === paymentLedgerHistoryEventTypes.submitted
  )

  const dueSummaryRows =
    currentRegistrationPayment.pendingMemberDueDays.length > 0
      ? [
          {
            dateGroups: currentRegistrationPayment.pendingMemberDueDays.map(day => ({
              amount: day.amount,
              id: day.addedAt,
              meta: `Member(s) added ${formatDate(day.addedAt)}`,
              names: day.memberNames
            })),
            id: 'registration-due',
            label: 'Registrations Fee',
            value: currentRegistrationPayment.balanceDues
          }
        ]
      : [
          {
            id: 'registration-due',
            label: 'Registrations Fee',
            value: currentRegistrationPayment.balanceDues
          }
        ]

  return [
    dueSummaryRows,
    [
      buildAmountSentSummaryRow({
        amountSentDate,
        amountSentValue: currentRegistrationPayment.amountReceived,
        submittedPaymentLedgerEntries
      })
    ],
    [
      buildAmountVerifiedSummaryRow({
        amountVerifiedDate,
        amountVerifiedValue: currentRegistrationPayment.amountVerified,
        submittedPaymentLedgerEntries,
        verifiedAt: currentRegistrationPayment.verifiedAt
      })
    ]
  ]
}

const PaymentBalanceRow = ({
  balance,
  contributionVestedMembersCount,
  deficitNoticeLabel = 'Not In Good Standing',
  reserveLabel
}: {
  balance: number
  contributionVestedMembersCount?: number
  deficitNoticeLabel?: string
  reserveLabel: string
}) => {
  const balanceClassName =
    contributionVestedMembersCount === undefined
      ? balance >= 0
        ? 'text-green-700 dark:text-green-300'
        : 'text-red-700 dark:text-red-300'
      : getContributionBalanceTextClassName(balance, contributionVestedMembersCount)

  const showReplenishAccountNotice =
    contributionVestedMembersCount !== undefined &&
    shouldShowReplenishAccountNotice(balance, contributionVestedMembersCount)

  const balanceLabel = showReplenishAccountNotice
    ? 'LOW RESERVE(please replenish)'
    : getReserveOrDeficitLabel(balance, reserveLabel)

  const showNotInGoodStandingNotice = shouldShowNotInGoodStandingNotice(balance)

  const showUpcomingMonthsNotice =
    !showReplenishAccountNotice &&
    !showNotInGoodStandingNotice &&
    (balance > 0 || (balance === 0 && contributionVestedMembersCount === undefined))

  return (
    <div className={cn('mt-2 flex items-start justify-between gap-4 text-2xl font-extrabold', balanceClassName)}>
      <span className='min-w-0 break-words'>
        {balanceLabel}
        {showNotInGoodStandingNotice ? (
          <span className='text-[15px] leading-tight font-medium'>({deficitNoticeLabel})</span>
        ) : null}
        {showUpcomingMonthsNotice ? (
          <span className='text-[15px] leading-tight font-medium'>(To be used for upcoming months)</span>
        ) : null}
      </span>
      <span className='shrink-0 text-right tabular-nums'>{formatCurrency(balance)}</span>
    </div>
  )
}

const PaymentRouteCard = ({
  amount,
  cta,
  description,
  details,
  href,
  title
}: {
  amount: number
  cta: string
  description: ReactNode
  details: ReactNode
  href: string
  title: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='flex items-center gap-2 text-lg font-extrabold break-words sm:text-xl'>
      <CircleDollarSign className='size-5 shrink-0' aria-hidden='true' />
      {title}: {formatCurrency(amount)}
    </p>
    <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{description}</p>
    <div className='text-primary/80 mt-3 grid gap-1.5 text-xs font-semibold'>{details}</div>
    <Button asChild className='mt-4 w-fit'>
      <Link href={href}>
        {cta}
        <ArrowRight aria-hidden='true' />
      </Link>
    </Button>
  </div>
)

export const SponsorPaymentNavigationCards = ({
  currentContribution,
  currentRegistrationPayment,
  pendingMembersCount
}: {
  currentContribution: CurrentContributionPayment
  currentRegistrationPayment: CurrentRegistrationPayment
  pendingMembersCount: number
}) => {
  const currentMonthName = getCurrentMonthName()
  const registrationPaymentAmount = getRegistrationPaymentAmount(pendingMembersCount)

  return (
    <div className='grid w-full min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-2'>
      <PaymentRouteCard
        amount={currentContribution.amountOwed}
        cta='Go to contribution payment'
        description={
          <>
            {currentContribution.vestedMembersCount} vested loved one(s) x{' '}
            {formatCurrency(currentContribution.amountPerVestedMember)}
          </>
        }
        details={
          <>
            <SummaryRow label='Sent' value={currentContribution.amountReceived} />
            <SummaryRow label='Verified' value={currentContribution.amountVerified} />
          </>
        }
        href='/contributions-payments'
        title={`${currentMonthName}'s Contribution`}
      />
      <PaymentRouteCard
        amount={registrationPaymentAmount}
        cta='Go to registration payment'
        description={
          <>
            {pendingMembersCount} pending loved one(s) x {formatCurrency(registrationFeePerPendingMember)}
          </>
        }
        details={
          <>
            <SummaryRow label='Sent' value={currentRegistrationPayment.amountReceived} />
            <SummaryRow label='Verified' value={currentRegistrationPayment.amountVerified} />
          </>
        }
        href='/registration-payments'
        title='Registration Payment'
      />
    </div>
  )
}

export const SponsorContributionPaymentSection = ({
  className,
  currentContribution,
  ledgerEntries
}: {
  className?: string
  currentContribution: CurrentContributionPayment
  ledgerEntries: SponsorPaymentLedgerEntry[]
}) => {
  const currentMonthName = getCurrentMonthName()
  const amountSent = Math.max(currentContribution.amountReceived, currentContribution.amountVerified)
  const historySummaryColumns = buildContributionHistorySummaryColumns(currentContribution, ledgerEntries)

  return (
    <section className={cn('max-w-full min-w-0 space-y-6 py-4 sm:py-10', className)}>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Contribution Payment</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <strong className='font-extrabold'>SAGICAM-{currentContribution.sponsorCode}</strong> in the memo so the
          payment can be matched to your account, then record the amount sent.
        </p>
      </div>

      <div className='grid w-full min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <PaymentAmountCard
            amount={currentContribution.amountOwed}
            description={
              <>
                {currentContribution.vestedMembersCount} vested loved one(s) x{' '}
                {formatCurrency(currentContribution.amountPerVestedMember)}
              </>
            }
            title={`${currentMonthName}'s Contribution`}
          />
          <PaymentInstructionsCard />
        </div>

        <PaymentQrCard />

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <SponsorContributionPaymentCard amountExpected={currentContribution.amountOwed} amountSent={amountSent} />
          <ContributionSummaryCard currentContribution={currentContribution} currentMonthName={currentMonthName} />
        </div>
      </div>

      <PaymentLedgerHistoryCard summaryColumns={historySummaryColumns} />
    </section>
  )
}

export const SponsorRegistrationPaymentSection = ({
  className,
  currentRegistrationPayment,
  ledgerEntries,
  pendingMembersCount
}: {
  className?: string
  currentRegistrationPayment: CurrentRegistrationPayment
  ledgerEntries: SponsorPaymentLedgerEntry[]
  pendingMembersCount: number
}) => {
  const registrationPaymentAmount = getRegistrationPaymentAmount(pendingMembersCount)
  const amountSent = Math.max(currentRegistrationPayment.amountReceived, currentRegistrationPayment.amountVerified)
  const historySummaryColumns = buildRegistrationHistorySummaryColumns(currentRegistrationPayment, ledgerEntries)

  return (
    <section className={cn('max-w-full min-w-0 space-y-6 py-4 sm:py-10', className)}>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Registration Payment</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <strong className='font-extrabold'>SAGICAM-{currentRegistrationPayment.sponsorCode}</strong> in the memo so
          the payment can be matched to your account, then record the amount sent.
        </p>
      </div>

      <div className='grid w-full min-w-0 grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <PaymentAmountCard
            amount={registrationPaymentAmount}
            description={
              <>
                {pendingMembersCount} pending loved one(s) x {formatCurrency(registrationFeePerPendingMember)}
              </>
            }
            title='Your Registration Dues'
          />
          <PaymentInstructionsCard />
        </div>

        <PaymentQrCard />

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <SponsorRegistrationPaymentCard amountExpected={registrationPaymentAmount} amountSent={amountSent} />
          <RegistrationSummaryCard currentRegistrationPayment={currentRegistrationPayment} />
        </div>
      </div>

      <PaymentLedgerHistoryCard summaryColumns={historySummaryColumns} />
    </section>
  )
}
