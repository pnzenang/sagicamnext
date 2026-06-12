'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { saveSponsorContributionPaymentAction } from '@/utils/actions'

type SponsorContributionPaymentCardProps = {
  amountExpected: number
  amountSent: number
}

const initialState = {
  message: ''
}

const SponsorContributionPaymentCard = ({ amountExpected, amountSent }: SponsorContributionPaymentCardProps) => {
  const [state, formAction] = useActionState(saveSponsorContributionPaymentAction, initialState)
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
          <Label htmlFor='amountSent' className='text-base font-extrabold'>
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
              defaultValue={amountSent || ''}
              placeholder='0.00'
              className='bg-background pl-9 text-foreground'
              required
            />
          </div>
        </div>

        <SubmitButton text='Save amount sent' className='w-full' />
        {state.message ? <p className='text-sm font-semibold'>{state.message}</p> : null}
      </div>
    </form>
  )
}

export default SponsorContributionPaymentCard
