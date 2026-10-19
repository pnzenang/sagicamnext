'use client'

import { useActionState, useEffect, useId } from 'react'

import { DollarSign } from 'lucide-react'
import { toast } from 'sonner'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSponsorContributionPaymentAction, saveSponsorRegistrationPaymentAction } from '@/utils/actions'
import type { PaymentCenterType } from '@/utils/sagicam-payment-details'

const initialState = {
  message: ''
}

const paymentFormCopy = {
  contribution: {
    fieldName: 'amountSent',
    label: 'Contribution Amount Sent',
    submitText: 'Submit Contribution Amount'
  },
  registration: {
    fieldName: 'registrationAmountSent',
    label: 'Registration Amount Sent',
    submitText: 'Submit Registration Amount'
  }
} as const

const ZellePaymentAmountForm = ({ paymentType }: { paymentType: PaymentCenterType }) => {
  const amountInputId = useId()

  const action =
    paymentType === 'registration' ? saveSponsorRegistrationPaymentAction : saveSponsorContributionPaymentAction

  const [state, formAction] = useActionState(action, initialState)
  const copy = paymentFormCopy[paymentType]

  useEffect(() => {
    if (state.message) toast(state.message)
  }, [state])

  return (
    <form action={formAction} className='mx-auto mt-6 grid w-full max-w-3xl gap-4 text-left'>
      <div className='grid gap-2'>
        <Label htmlFor={amountInputId} className='text-primary text-lg font-semibold sm:text-xl lg:text-2xl'>
          {copy.label}
        </Label>
        <div className='relative'>
          <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2' />
          <Input
            id={amountInputId}
            name={copy.fieldName}
            type='number'
            inputMode='decimal'
            min='0'
            step='0.01'
            placeholder='0.00'
            className='h-14 pl-11 text-lg font-normal sm:text-xl'
            required
          />
        </div>
      </div>

      <SubmitButton text={copy.submitText} className='w-full' />
      {state.message ? <p className='text-primary text-sm font-normal break-words'>{state.message}</p> : null}
    </form>
  )
}

export default ZellePaymentAmountForm
