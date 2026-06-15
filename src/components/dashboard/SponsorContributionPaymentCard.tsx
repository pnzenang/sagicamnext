'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { saveSponsorContributionPaymentAction } from '@/utils/actions'

type SponsorContributionPaymentCardProps = {
  amountExpected: number
  amountSent: number
}

const initialState = {
  message: ''
}

const zelleReminder =
  'Please do not enter the amount if you have not sent the Zelle yet. Send the Zelle before you enter the amount in the form.'

const SponsorContributionPaymentCard = ({ amountExpected, amountSent }: SponsorContributionPaymentCardProps) => {
  const [state, formAction] = useActionState(saveSponsorContributionPaymentAction, initialState)
  const cardIsComplete = amountSent >= amountExpected

  return (
    <form
      action={formAction}
      aria-label={cardIsComplete ? 'Contribution payment complete' : 'Contribution payment pending'}
      className='border-secondary bg-secondary text-secondary-foreground h-full min-h-56 min-w-0 rounded-md border px-3 py-3 sm:px-4'
    >
      <div className='grid gap-3'>
        <div className='grid gap-2'>
          <Label htmlFor='amountSent' className='text-sm font-extrabold break-words sm:text-base'>
            Contribution Amount sent
          </Label>
          <div className='relative'>
            <DollarSign className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 opacity-70' />
            <Input
              id='amountSent'
              name='amountSent'
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
        <SubmitButton text='Add Contribution Amount Sent' className='w-full whitespace-normal' />
        {state.message ? <p className='text-sm font-semibold break-words'>{state.message}</p> : null}
      </div>
    </form>
  )
}

export default SponsorContributionPaymentCard
