'use client'

import { useActionState } from 'react'

import { DollarSign } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createContributionAssessmentAction } from '@/utils/actions'

type ContributionAssessmentFormProps = {
  vestedMembersCount: number
}

const initialState = {
  message: ''
}

const ContributionAssessmentForm = ({ vestedMembersCount }: ContributionAssessmentFormProps) => {
  const [state, formAction] = useActionState(createContributionAssessmentAction, initialState)

  return (
    <Card className='border-primary/30 py-0'>
      <CardHeader className='border-b py-5'>
        <CardTitle className='text-xl'>Create amount owed by sponsor code</CardTitle>
        <CardDescription>
          Enter a total dollar amount. The system divides it by all vested loved ones, then multiplies that amount by
          the number of vested loved ones under each sponsor code.
        </CardDescription>
      </CardHeader>
      <CardContent className='py-5'>
        <form action={formAction} className='grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end'>
          <div className='grid gap-2'>
            <Label htmlFor='totalAmount'>Total amount in dollars</Label>
            <div className='relative'>
              <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
              <Input
                id='totalAmount'
                name='totalAmount'
                type='number'
                inputMode='decimal'
                min='0.01'
                step='0.01'
                placeholder='6000.00'
                className='pl-9'
                required
              />
            </div>
            <p className='text-muted-foreground text-sm'>Vested loved ones currently counted: {vestedMembersCount}</p>
            {state.message ? <p className='text-primary text-sm font-medium'>{state.message}</p> : null}
          </div>

          <SubmitButton text='Distribute amount' className='w-full lg:w-auto' />
        </form>
      </CardContent>
    </Card>
  )
}

export default ContributionAssessmentForm
