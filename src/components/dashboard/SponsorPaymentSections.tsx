'use client'

import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, CheckCircle2, CircleDollarSign, FileText, QrCode, ShieldCheck } from 'lucide-react'

import SponsorContributionPaymentCard from '@/components/dashboard/SponsorContributionPaymentCard'
import SponsorRegistrationPaymentCard from '@/components/dashboard/SponsorRegistrationPaymentCard'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type CurrentContributionPayment = {
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

export type CurrentRegistrationPayment = {
  amountReceived: number
  amountUsed: number
  amountVerified: number
  balance: number
  manualBalanceAdjustment: number
  sponsorCode: string
}

export const registrationFeePerPendingMember = 40

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'long'
})

const sagicamPaymentUrl =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'

const sagicamQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'

const getCurrentMonthName = () => monthFormatter.format(new Date())

const formatCurrency = (amount: number) => currencyFormatter.format(amount)

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
  title
}: {
  amount: number
  description: ReactNode
  title: string
}) => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-w-0 flex-col rounded-md border px-3 py-3 sm:px-4'>
    <p className='text-lg font-extrabold break-words sm:text-xl'>
      {title}: {formatCurrency(amount)}
    </p>
    <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>{description}</p>
  </div>
)

const PaymentQrCard = ({ memoLabel }: { memoLabel: string }) => (
  <div className='grid gap-4 md:grid-cols-[minmax(0,220px)_1fr] xl:grid-cols-1'>
    <Link
      href={sagicamPaymentUrl}
      target='_blank'
      rel='noreferrer'
      className='border-primary/20 bg-background flex min-h-44 min-w-0 items-center justify-center rounded-md border p-3'
    >
      <Image
        src={sagicamQrCodeUrl}
        width={190}
        height={190}
        alt='SAGICAM payment QR code'
        className='h-auto max-h-48 w-full max-w-48'
      />
    </Link>
    <div className='border-primary/20 bg-primary/10 text-primary flex min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
      <p className='flex items-center gap-2 text-lg font-extrabold break-words sm:text-xl'>
        <QrCode className='size-5 shrink-0' aria-hidden='true' />
        Zelle payment
      </p>
      <p className='text-primary/80 mt-1 text-sm font-semibold break-words'>
        Scan or click the QR code to send your payment by Zelle. Add your sponsor code and write {memoLabel} in the memo
        so SAGICAM can match the payment.
      </p>
    </div>
  </div>
)

const PaymentChecklist = ({ reminders }: { reminders: string[] }) => (
  <div className='rounded-md border p-5'>
    <div className='mb-3 flex items-center gap-2 font-semibold'>
      <ShieldCheck className='text-primary size-5' aria-hidden='true' />
      Before you submit
    </div>
    <div className='grid gap-3'>
      {reminders.map(reminder => (
        <div key={reminder} className='text-muted-foreground flex items-start gap-2'>
          <CheckCircle2 className='text-primary mt-0.5 size-4 shrink-0' aria-hidden='true' />
          <p className='text-sm leading-6'>{reminder}</p>
        </div>
      ))}
    </div>
  </div>
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
      {currentContribution.manualBalanceAdjustment > 0 ? (
        <SummaryRow label='Balance Adjustment' value={currentContribution.manualBalanceAdjustment} />
      ) : null}
    </div>
    <PaymentBalanceRow balance={currentContribution.balance} />
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
      {currentRegistrationPayment.manualBalanceAdjustment > 0 ? (
        <SummaryRow label='Balance Adjustment' value={currentRegistrationPayment.manualBalanceAdjustment} />
      ) : null}
    </div>
    <PaymentBalanceRow balance={currentRegistrationPayment.balance} />
    <p className='text-primary/70 mt-auto pt-4 text-[10px] leading-tight font-medium break-words'>
      All amounts will be verified by SAGICAM and reversed if not accurate.
    </p>
  </div>
)

const PaymentBalanceRow = ({ balance }: { balance: number }) => (
  <div
    className={cn(
      'mt-2 flex items-start justify-between gap-4 text-base font-extrabold',
      balance >= 0 ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'
    )}
  >
    <span className='min-w-0 break-words'>
      Balance{' '}
      {balance >= 0 ? (
        <span className='text-[10px] leading-tight font-medium'>(To be used for upcoming months)</span>
      ) : null}
    </span>
    <span className='shrink-0 text-right tabular-nums'>{formatCurrency(balance)}</span>
  </div>
)

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
    <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
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
      <div className='border-primary/20 bg-background flex h-full min-w-0 flex-col rounded-md border p-4'>
        <div className='mb-3 flex items-center gap-2 font-semibold'>
          <FileText className='text-primary size-5' aria-hidden='true' />
          Payments are now split
        </div>
        <p className='text-muted-foreground text-sm leading-6'>
          Use the contribution page for monthly contributions and the registration page for registration fees. Send the
          Zelle first, then submit the amount on the matching page.
        </p>
      </div>
    </div>
  )
}

export const SponsorContributionPaymentSection = ({
  className,
  currentContribution
}: {
  className?: string
  currentContribution: CurrentContributionPayment
}) => {
  const currentMonthName = getCurrentMonthName()
  const amountSent = Math.max(currentContribution.amountReceived, currentContribution.amountVerified)

  return (
    <div className={cn('grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]', className)}>
      <div className='grid gap-4'>
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
        <PaymentQrCard memoLabel='contribution payment' />
        <PaymentChecklist
          reminders={[
            'Only submit this form after the Zelle contribution payment has been sent.',
            'Use this page for monthly contributions only, not registration fees.',
            'If you send more than the current amount due, the positive balance can be tracked for upcoming contributions.'
          ]}
        />
      </div>
      <div className='grid gap-4'>
        <SponsorContributionPaymentCard amountExpected={currentContribution.amountOwed} amountSent={amountSent} />
        <ContributionSummaryCard currentContribution={currentContribution} currentMonthName={currentMonthName} />
      </div>
    </div>
  )
}

export const SponsorRegistrationPaymentSection = ({
  className,
  currentRegistrationPayment,
  pendingMembersCount
}: {
  className?: string
  currentRegistrationPayment: CurrentRegistrationPayment
  pendingMembersCount: number
}) => {
  const registrationPaymentAmount = getRegistrationPaymentAmount(pendingMembersCount)
  const amountSent = Math.max(currentRegistrationPayment.amountReceived, currentRegistrationPayment.amountVerified)

  return (
    <div className={cn('grid gap-4 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]', className)}>
      <div className='grid gap-4'>
        <PaymentAmountCard
          amount={registrationPaymentAmount}
          description={
            <>
              {pendingMembersCount} pending loved one(s) x {formatCurrency(registrationFeePerPendingMember)}
            </>
          }
          title='Registration Payment'
        />
        <PaymentQrCard memoLabel='registration payment' />
        <PaymentChecklist
          reminders={[
            'Only submit this form after the Zelle registration payment has been sent.',
            'Use this page for registration fees only, not monthly contributions.',
            'If you are paying registration fees and contributions at the same time, submit each amount on its matching page.'
          ]}
        />
      </div>
      <div className='grid gap-4'>
        <SponsorRegistrationPaymentCard amountExpected={registrationPaymentAmount} amountSent={amountSent} />
        <RegistrationSummaryCard currentRegistrationPayment={currentRegistrationPayment} />
      </div>
    </div>
  )
}
