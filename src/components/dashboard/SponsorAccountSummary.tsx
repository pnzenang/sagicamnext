import Link from 'next/link'

import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, UserX } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  registrationFeePerPendingMember,
  type CurrentContributionPayment,
  type CurrentRegistrationPayment
} from '@/components/dashboard/SponsorPaymentSections'
import { sagicamTimeZone } from '@/utils/sagicam-time-zone'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'long',
  timeZone: sagicamTimeZone
})

const roundCurrencyAmount = (amount: number) => Number(amount.toFixed(2))

type SponsorAccountSummaryProps = {
  currentContribution: CurrentContributionPayment
  currentRegistrationPayment: CurrentRegistrationPayment
  delinquentMembersCount: number
  pendingMembersCount: number
}

const AmountRow = ({ label, value, hint }: { hint?: string; label: string; value: number }) => (
  <div className='flex items-start justify-between gap-4'>
    <div className='min-w-0'>
      <p className='text-sm font-semibold sm:text-base'>{label}</p>
      {hint ? <p className='text-muted-foreground mt-0.5 text-xs sm:text-sm'>{hint}</p> : null}
    </div>
    <p className='shrink-0 text-right text-base font-extrabold tabular-nums sm:text-lg'>
      {currencyFormatter.format(value)}
    </p>
  </div>
)

const SponsorAccountSummary = ({
  currentContribution,
  currentRegistrationPayment,
  delinquentMembersCount,
  pendingMembersCount
}: SponsorAccountSummaryProps) => {
  const contributionDue = roundCurrencyAmount(Math.max(0, -currentContribution.balance))
  const registrationDue = roundCurrencyAmount(Math.max(0, -currentRegistrationPayment.balance))
  const totalDue = roundCurrencyAmount(contributionDue + registrationDue)
  const contributionReserve = roundCurrencyAmount(Math.max(0, currentContribution.balance))
  const isAllSet = totalDue === 0

  const contributionHint =
    contributionDue > 0
      ? currentContribution.amountOwed > 0 && currentContribution.dueDate
        ? `Includes this month's contribution, due ${dateFormatter.format(new Date(currentContribution.dueDate))}`
        : 'Contribution deficit to clear'
      : contributionReserve > 0
        ? `You have a ${currencyFormatter.format(contributionReserve)} reserve for upcoming months`
        : 'Nothing due right now'

  const registrationHint =
    registrationDue > 0
      ? `${pendingMembersCount} pending loved one${pendingMembersCount === 1 ? '' : 's'} x ${currencyFormatter.format(registrationFeePerPendingMember)}`
      : 'Nothing due right now'

  return (
    <section
      aria-labelledby='sponsor-account-summary-title'
      className={cn(
        'bg-card w-full min-w-0 rounded-lg border p-4 shadow-sm sm:p-6',
        isAllSet ? 'border-green-300 dark:border-green-800' : 'border-amber-300 dark:border-amber-800'
      )}
    >
      <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
        <div className='flex min-w-0 items-start gap-3'>
          <span
            className={cn(
              'flex size-11 shrink-0 items-center justify-center rounded-full',
              isAllSet
                ? 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            )}
          >
            {isAllSet ? (
              <CheckCircle2 className='size-6' aria-hidden='true' />
            ) : (
              <AlertTriangle className='size-6' aria-hidden='true' />
            )}
          </span>
          <div className='min-w-0'>
            <p id='sponsor-account-summary-title' className='text-muted-foreground text-sm font-semibold'>
              Your account at a glance
            </p>
            <p className='mt-1 text-2xl font-extrabold tracking-normal break-words sm:text-3xl'>
              {isAllSet ? "You're all set" : `You have ${currencyFormatter.format(totalDue)} to pay`}
            </p>
            {isAllSet ? (
              <p className='text-muted-foreground mt-1 text-sm'>Nothing is due right now. Thank you!</p>
            ) : null}
          </div>
        </div>
        {!isAllSet ? (
          <Button asChild size='lg' className='w-full shrink-0 sm:w-fit'>
            <Link href='/payment-center'>
              Pay now
              <ArrowRight aria-hidden='true' />
            </Link>
          </Button>
        ) : null}
      </div>

      <div className='mt-5 grid gap-4 border-t pt-4 md:grid-cols-2 md:gap-8'>
        <AmountRow label='Contribution' value={contributionDue} hint={contributionHint} />
        <AmountRow label='Registration fees' value={registrationDue} hint={registrationHint} />
      </div>

      {pendingMembersCount > 0 || delinquentMembersCount > 0 ? (
        <ul className='mt-4 grid gap-2 border-t pt-4 text-sm'>
          {pendingMembersCount > 0 ? (
            <li className='flex items-start gap-2'>
              <Clock3 className='mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400' aria-hidden='true' />
              <span>
                {pendingMembersCount} loved one{pendingMembersCount === 1 ? ' is' : 's are'} pending until the
                registration fee is paid and verified.
              </span>
            </li>
          ) : null}
          {delinquentMembersCount > 0 ? (
            <li className='flex items-start gap-2'>
              <UserX className='mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400' aria-hidden='true' />
              <span>
                {delinquentMembersCount} loved one{delinquentMembersCount === 1 ? ' is' : 's are'} not in good
                standing. Contact SAGICAM to bring them back.
              </span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </section>
  )
}

export default SponsorAccountSummary
