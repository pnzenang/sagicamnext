'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { saveSponsorRegistrationPaymentAction } from '@/utils/actions'

type SponsorRegistrationPaymentCardProps = {
  amountExpected: number
  amountSent: number
}

const initialState = {
  message: ''
}

const SponsorRegistrationPaymentCard = ({ amountExpected, amountSent }: SponsorRegistrationPaymentCardProps) => {
  const [state, formAction] = useActionState(saveSponsorRegistrationPaymentAction, initialState)
  const cardIsComplete = amountSent >= amountExpected

  return (
    <form
      action={formAction}
      className={cn(
        'rounded-md border px-4 py-3',
        cardIsComplete
          ? 'border-green-600/20 bg-green-600/10 text-green-700 dark:text-green-300'
          : 'border-red-600/20 bg-red-600/10 text-red-700 dark:text-red-300'
      )}
    >
      <div className='grid gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor='registrationAmountSent' className='text-base font-extrabold'>
            Registration amount sent
          </Label>
          <div className='relative'>
            <DollarSign className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-70' />
            <Input
              id='registrationAmountSent'
              name='registrationAmountSent'
              type='number'
              inputMode='decimal'
              min='0'
              step='0.01'
              defaultValue={amountSent || ''}
              placeholder='0.00'
              className='bg-background pl-9 text-foreground'
              required
            />
          </div>
        </div>

        <SubmitButton text='Save registration amount' className='w-full' />
        {state.message ? <p className='text-sm font-semibold'>{state.message}</p> : null}
      </div>
    </form>
  )
}

export default SponsorRegistrationPaymentCard
