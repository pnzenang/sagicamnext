'use client'

import { useState } from 'react'

import Link from 'next/link'

import { Banknote, CreditCard, History, Landmark, WalletCards } from 'lucide-react'
import { SiZelle } from 'react-icons/si'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  getRegistrationPaymentAmount,
  registrationFeePerPendingMember
} from '@/components/dashboard/SponsorPaymentSections'
import {
  getPaymentCenterMethodHref,
  getSagicamPaymentMemo,
  type PaymentCenterType
} from '@/utils/sagicam-payment-details'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const paymentHistoryHrefs: Record<PaymentCenterType, string> = {
  contribution: '/contributions-payments',
  registration: '/registration-payments'
}

const paymentOptionCardClassName =
  'border-primary/20 bg-primary/10 text-primary flex min-h-48 w-full flex-col items-center justify-center rounded-lg border p-5 text-center shadow-sm sm:min-h-64 sm:p-6'

const paymentOptionLinkClassName =
  'max-w-full text-lg font-extrabold break-words underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:text-xl'

const PaymentOptionCards = ({ paymentType }: { paymentType: PaymentCenterType }) => (
  <>
    <div className={paymentOptionCardClassName}>
      <SiZelle className='mb-4 size-12 text-[#6d1ed4]' aria-hidden='true' />
      <Link href={getPaymentCenterMethodHref(paymentType, 'zelle')} className={paymentOptionLinkClassName}>
        Pay with Zelle
      </Link>
    </div>

    <div className={paymentOptionCardClassName}>
      <Landmark className='mb-4 size-12' aria-hidden='true' />
      <Link href={getPaymentCenterMethodHref(paymentType, 'bank-deposit')} className={paymentOptionLinkClassName}>
        Pay by Bank Deposit/Transfer
      </Link>
    </div>
  </>
)

type PaymentDetailsProps = {
  amount: number
  detailCount: number
  detailLabel: string
  detailUnitAmount: number
  emptyMessage: string
  hasPaymentDue: boolean
  paymentType: PaymentCenterType
  title: string
  totalLabel: string
}

const PaymentHistoryLink = ({ paymentType }: { paymentType: PaymentCenterType }) => (
  <Link
    href={paymentHistoryHrefs[paymentType]}
    className='mt-4 inline-flex items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline'
  >
    <History className='size-4' aria-hidden='true' />
    View balance and payment history
  </Link>
)

const PaymentDetails = ({
  amount,
  detailCount,
  detailLabel,
  detailUnitAmount,
  emptyMessage,
  hasPaymentDue,
  paymentType,
  title,
  totalLabel
}: PaymentDetailsProps) => {
  if (!hasPaymentDue) {
    return (
      <div className='border-primary/20 bg-primary/10 text-primary w-full rounded-lg border p-4 shadow-sm sm:p-6'>
        <p className='text-lg font-extrabold break-words sm:text-xl'>{title}</p>
        <p className='text-primary/80 mt-2 text-sm font-semibold break-words'>{emptyMessage}</p>
        <PaymentHistoryLink paymentType={paymentType} />
      </div>
    )
  }

  return (
    <div className='grid w-full gap-4 lg:grid-cols-2'>
      <div className='border-primary/20 bg-primary/10 text-primary flex min-h-64 w-full flex-col items-center justify-center rounded-lg border p-6 text-center shadow-sm sm:p-10 lg:col-span-2'>
        <Banknote className='mb-5 size-14' aria-hidden='true' />
        <p className='max-w-full text-2xl font-extrabold break-words sm:text-3xl lg:text-4xl'>{title}</p>
        <p className='mt-4 max-w-full text-xl font-extrabold break-words sm:text-2xl lg:text-3xl'>
          {totalLabel}: {currencyFormatter.format(amount)}
        </p>
        <p className='text-primary/80 mt-3 max-w-full text-base font-semibold break-words sm:text-lg lg:text-xl'>
          {detailCount} {detailLabel}
          {detailCount === 1 ? '' : 's'} x {currencyFormatter.format(detailUnitAmount)}
        </p>
        <PaymentHistoryLink paymentType={paymentType} />
      </div>

      <PaymentOptionCards paymentType={paymentType} />
    </div>
  )
}

type PaymentCenterProps = {
  contributionAmountOwed: number
  contributionAmountPerVestedMember: number
  contributionVestedMembersCount: number
  pendingRegistrationMembersCount: number
  sponsorCode: string
}

const PaymentCenter = ({
  contributionAmountOwed,
  contributionAmountPerVestedMember,
  contributionVestedMembersCount,
  pendingRegistrationMembersCount,
  sponsorCode
}: PaymentCenterProps) => {
  const [paymentType, setPaymentType] = useState<PaymentCenterType | ''>('')
  const registrationDues = getRegistrationPaymentAmount(pendingRegistrationMembersCount)
  const contributionPaymentAmount = Math.max(contributionAmountOwed, 0)

  const selectedPaymentDetails: PaymentDetailsProps | null =
    paymentType === 'registration'
      ? {
          amount: registrationDues,
          detailCount: pendingRegistrationMembersCount,
          detailLabel: 'pending loved one',
          detailUnitAmount: registrationFeePerPendingMember,
          emptyMessage: 'You have no pending loved one at this time.',
          hasPaymentDue: pendingRegistrationMembersCount > 0,
          paymentType,
          title: 'Registration payment',
          totalLabel: 'Your Registration Dues'
        }
      : paymentType === 'contribution'
        ? {
            amount: contributionPaymentAmount,
            detailCount: contributionVestedMembersCount,
            detailLabel: 'vested loved one',
            detailUnitAmount: contributionAmountPerVestedMember,
            emptyMessage: 'You have no contribution payment at this time.',
            hasPaymentDue: contributionPaymentAmount > 0,
            paymentType,
            title: 'Contribution payment',
            totalLabel: 'Your Contribution Amount'
          }
        : null

  return (
    <section className='mx-auto grid w-full max-w-[90rem] min-w-0 shrink-0 gap-5 overflow-visible px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div className='bg-primary text-primary-foreground border-primary/30 w-full rounded-lg border p-5 shadow-md sm:p-7'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex min-w-0 items-center gap-4'>
            <span className='bg-primary-foreground/15 flex size-14 shrink-0 items-center justify-center rounded-lg'>
              <WalletCards className='size-7' aria-hidden='true' />
            </span>
            <div className='min-w-0'>
              <h1 className='text-3xl font-extrabold tracking-normal sm:text-4xl'>Payment Center</h1>
              <p className='text-primary-foreground/85 mt-2 max-w-3xl text-base font-medium sm:text-lg'>
                Choose the payment type, review the amount due, then continue with your preferred payment method.
                Always add <strong className='font-extrabold'>{getSagicamPaymentMemo(sponsorCode)}</strong> in the
                memo.
              </p>
            </div>
          </div>

          <div className='grid shrink-0 gap-3 sm:grid-cols-2 lg:min-w-[28rem]'>
            <div className='bg-primary-foreground/10 ring-primary-foreground/20 rounded-lg p-4 ring-1'>
              <p className='text-primary-foreground/80 text-sm font-semibold'>Registration due</p>
              <p className='mt-1 text-2xl font-extrabold'>{currencyFormatter.format(registrationDues)}</p>
            </div>
            <div className='bg-primary-foreground/10 ring-primary-foreground/20 rounded-lg p-4 ring-1'>
              <p className='text-primary-foreground/80 text-sm font-semibold'>Contribution amount</p>
              <p className='mt-1 text-2xl font-extrabold'>{currencyFormatter.format(contributionPaymentAmount)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className='grid w-full gap-5 md:grid-cols-2'>
        <div className='border-primary/25 bg-background w-full rounded-lg border p-4 shadow-sm sm:p-6'>
          <div className='flex items-start gap-3'>
            <span className='bg-primary/10 text-primary flex size-10 shrink-0 items-center justify-center rounded-lg'>
              <CreditCard className='size-5' aria-hidden='true' />
            </span>
            <h2 className='min-w-0 text-2xl font-extrabold tracking-normal sm:text-3xl'>
              What type of payment are you making?
            </h2>
          </div>
        </div>

        <div className='border-primary/25 bg-background w-full rounded-lg border p-4 shadow-sm sm:p-6'>
          <div className='grid w-full gap-2'>
            <Label htmlFor='payment-type'>Payment type</Label>
            <Select value={paymentType} onValueChange={value => setPaymentType(value as PaymentCenterType)}>
              <SelectTrigger id='payment-type' className='w-full'>
                <SelectValue placeholder='Select payment type' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='registration'>Registration payment</SelectItem>
                <SelectItem value='contribution'>Contribution payment</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {selectedPaymentDetails ? <PaymentDetails {...selectedPaymentDetails} /> : null}
    </section>
  )
}

export default PaymentCenter
