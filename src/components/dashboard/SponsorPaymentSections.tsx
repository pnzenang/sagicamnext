'use client'

import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, CircleDollarSign, FileText } from 'lucide-react'

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

const PaymentInstructionCard = () => (
  <div className='border-primary/20 bg-primary/10 text-primary flex h-full min-h-32 min-w-0 flex-col justify-center rounded-md border px-3 py-3 sm:px-4'>
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
    <section className={cn('space-y-6 py-8 sm:py-10', className)}>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Contribution Payment</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <strong className='font-extrabold'>SAGICAM-{currentContribution.sponsorCode}</strong> in the memo so the
          payment can be matched to your account, then record the amount sent.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
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
          <PaymentInstructionCard />
        </div>

        <PaymentQrCard />

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <SponsorContributionPaymentCard amountExpected={currentContribution.amountOwed} amountSent={amountSent} />
          <ContributionSummaryCard currentContribution={currentContribution} currentMonthName={currentMonthName} />
        </div>
      </div>
    </section>
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
    <section className={cn('space-y-6 py-8 sm:py-10', className)}>
      <div>
        <h1 className='text-xl font-semibold tracking-normal md:text-4xl'>Registration Payment</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 sm:text-base'>
          Scan or click the QR code to send payment by Zelle. Add{' '}
          <strong className='font-extrabold'>SAGICAM-{currentRegistrationPayment.sponsorCode}</strong> in the memo so
          the payment can be matched to your account, then record the amount sent.
        </p>
      </div>

      <div className='grid w-full grid-cols-1 items-stretch gap-4 lg:grid-cols-3'>
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
          <PaymentInstructionCard />
        </div>

        <PaymentQrCard />

        <div className='grid h-full min-w-0 auto-rows-fr gap-4'>
          <SponsorRegistrationPaymentCard amountExpected={registrationPaymentAmount} amountSent={amountSent} />
          <RegistrationSummaryCard currentRegistrationPayment={currentRegistrationPayment} />
        </div>
      </div>
    </section>
  )
}
