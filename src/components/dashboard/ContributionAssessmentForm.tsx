'use client'

import { useActionState } from 'react'

import { CalendarDays, DollarSign, HeartHandshake } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  createContributionAssessmentFromCalculationAction,
  resetContributionCalculationAction
} from '@/utils/actions'

type ContributionAssessmentFormProps = {
  calculationDeathCount: number
  monthlyContributionTotal: number
  vestedMembersCount: number
}

const initialState = {
  message: ''
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const ContributionAssessmentForm = ({
  calculationDeathCount,
  monthlyContributionTotal,
  vestedMembersCount
}: ContributionAssessmentFormProps) => {
  const [state, formAction] = useActionState(createContributionAssessmentFromCalculationAction, initialState)
  const [resetState, resetFormAction] = useActionState(resetContributionCalculationAction, initialState)
  const hasContributionCalculation = calculationDeathCount > 0 && monthlyContributionTotal > 0

  return (
    <Card className='border-primary/30 bg-primary/10 w-full max-w-full min-w-0 overflow-hidden py-0'>
      <CardHeader className='border-primary/20 min-w-0 border-b py-5'>
        <CardTitle className='text-xl leading-tight break-words'>Amount to be contributed this month</CardTitle>
        <CardDescription className='break-words'>
          The monthly contribution total comes from Contribution Calculation. Publish Contribution saves the death table
          and divides the total by all vested loved ones, then multiplies that amount by each sponsor&apos;s vested loved
          ones.
        </CardDescription>
      </CardHeader>
      <CardContent className='min-w-0 py-5'>
        <div className='grid w-full min-w-0 gap-4'>
          <div className='grid w-full min-w-0 grid-cols-[minmax(0,1fr)] gap-4 md:grid-cols-4 md:items-end'>
            <form action={formAction} className='contents'>
              <div className='grid min-w-0 gap-2'>
                <Label>Monthly contribution total</Label>
                <div className='border-primary/40 bg-background text-foreground flex min-h-10 items-center gap-2 rounded-md border px-3 py-2 font-semibold'>
                  <DollarSign className='text-muted-foreground size-4 shrink-0' />
                  <span>{currencyFormatter.format(monthlyContributionTotal)}</span>
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='deathCount'>Number of deaths</Label>
                <div className='relative'>
                  <HeartHandshake className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='deathCount'
                    value={calculationDeathCount}
                    readOnly
                    className='border-primary/40 bg-background text-foreground pl-9 font-semibold'
                  />
                </div>
              </div>

              <div className='grid min-w-0 gap-2'>
                <Label htmlFor='dueDate'>Contribution due date</Label>
                <div className='relative'>
                  <CalendarDays className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='dueDate'
                    name='dueDate'
                    type='date'
                    className='border-primary/40 bg-background text-foreground pl-9'
                    required
                  />
                </div>
              </div>

              <SubmitButton
                text='Publish Contribution'
                disabled={!hasContributionCalculation}
                className='h-auto min-h-10 w-full min-w-0 px-3 py-2 text-center leading-tight whitespace-normal'
              />
            </form>

            <form action={resetFormAction} className='min-w-0'>
              <SubmitButton
                text='Reset calculation'
                className='h-auto min-h-10 w-full min-w-0 bg-red-600 px-3 py-2 whitespace-normal text-white hover:bg-red-700'
              />
            </form>
          </div>

          <div className='grid min-w-0 gap-2'>
            <p className='text-muted-foreground text-sm'>Vested loved ones currently counted: {vestedMembersCount}</p>
            {!hasContributionCalculation ? (
              <p className='text-destructive text-sm font-medium'>
                Add at least one death in Contribution Calculation before publishing.
              </p>
            ) : null}
            {state.message ? <p className='text-primary text-sm font-medium'>{state.message}</p> : null}
            {resetState.message ? <p className='text-primary text-sm font-medium'>{resetState.message}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContributionAssessmentForm
