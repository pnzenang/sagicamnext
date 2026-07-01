'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createContributionAssessmentAction, resetContributionCalculationAction } from '@/utils/actions'

type ContributionAssessmentFormProps = {
  vestedMembersCount: number
}

const initialState = {
  message: ''
}

const ContributionAssessmentForm = ({ vestedMembersCount }: ContributionAssessmentFormProps) => {
  const [state, formAction] = useActionState(createContributionAssessmentAction, initialState)
  const [resetState, resetFormAction] = useActionState(resetContributionCalculationAction, initialState)

  return (
    <Card className='border-primary/30 bg-primary/10 py-0'>
      <CardHeader className='border-primary/20 border-b py-5'>
        <CardTitle className='text-xl'>Amount to be contributed this month</CardTitle>
        <CardDescription>
          Enter a total dollar amount. The system divides it by all vested loved ones, then multiplies that amount by
          the number of vested loved ones under each sponsor code.
        </CardDescription>
      </CardHeader>
      <CardContent className='py-5'>
        <div className='grid gap-4'>
          <div className='grid gap-4 md:grid-cols-3 md:items-end'>
            <form action={formAction} className='contents'>
              <div className='grid gap-2'>
                <Label htmlFor='totalAmount'>Amount to be contributed this month</Label>
                <div className='relative'>
                  <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='totalAmount'
                    name='totalAmount'
                    type='number'
                    inputMode='decimal'
                    min='0.01'
                    step='0.01'
                    placeholder='0.00'
                    className='border-primary/40 bg-background pl-9 text-foreground'
                    required
                  />
                </div>
              </div>

              <SubmitButton text='Distribute amount to sponsors' className='w-full' />
            </form>

            <form action={resetFormAction}>
              <SubmitButton text='Reset contribution' className='w-full bg-red-600 text-white hover:bg-red-700' />
            </form>
          </div>

          <div className='grid gap-2'>
            <p className='text-muted-foreground text-sm'>Vested loved ones currently counted: {vestedMembersCount}</p>
            {state.message ? <p className='text-primary text-sm font-medium'>{state.message}</p> : null}
            {resetState.message ? <p className='text-primary text-sm font-medium'>{resetState.message}</p> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ContributionAssessmentForm
