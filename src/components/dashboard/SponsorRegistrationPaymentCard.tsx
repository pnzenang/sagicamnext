'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSponsorRegistrationPaymentAction } from '@/utils/actions'

type SponsorRegistrationPaymentCardProps = {
  amountExpected: number
  amountSent: number
}

const initialState = {
  message: ''
}

const zelleReminder =
  'Please do not enter the amount if you have not sent the Zelle yet. Send the Zelle before you enter the amount in the form.'

const SponsorRegistrationPaymentCard = ({ amountExpected, amountSent }: SponsorRegistrationPaymentCardProps) => {
  const [state, formAction] = useActionState(saveSponsorRegistrationPaymentAction, initialState)
  const cardIsComplete = amountSent >= amountExpected

  return (
    <form
      action={formAction}
      aria-label={cardIsComplete ? 'Registration payment complete' : 'Registration payment pending'}
      className='border-secondary bg-secondary text-secondary-foreground h-full min-h-56 min-w-0 rounded-md border px-3 py-3 sm:px-4'
    >
      <div className='grid gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor='registrationAmountSent' className='text-sm font-extrabold break-words sm:text-base'>
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
              placeholder='0.00'
              className='bg-background text-foreground pl-9'
              required
            />
          </div>
        </div>

        <p className='text-muted-foreground text-xs leading-snug font-semibold'>{zelleReminder}</p>
        <SubmitButton text='Add Registration Amount Sent' className='w-full whitespace-normal' />
        {state.message ? <p className='text-sm font-semibold break-words'>{state.message}</p> : null}
      </div>
    </form>
  )
}

export default SponsorRegistrationPaymentCard
