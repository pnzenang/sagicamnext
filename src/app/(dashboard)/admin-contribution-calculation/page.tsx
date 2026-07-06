import { DollarSign, HeartHandshake, Trash2 } from 'lucide-react'

import { SubmitButton } from '@/components/forms/Buttons'
import FormContainer from '@/components/forms/FormContainer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  addContributionCalculationDeathAction,
  deleteContributionCalculationDeathAction,
  fetchContributionCalculationDeathsAction,
  fetchContributionCalculationSummaryAction,
  saveContributionCalculationAdminFeeAction
} from '@/utils/actions'

const currencyFormatter = new Intl.NumberFormat('en-US', {
  currency: 'USD',
  style: 'currency'
})

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium'
})

const formatDate = (value: string) => {
  const date = new Date(value)

  return Number.isNaN(date.getTime()) ? value : dateFormatter.format(date)
}

const ContributionCalculationPage = async () => {
  const [calculationDeaths, calculationSummary] = await Promise.all([
    fetchContributionCalculationDeathsAction(),
    fetchContributionCalculationSummaryAction()
  ])

  const adminFeePerDeath =
    calculationSummary.deathCount > 0 ? calculationSummary.adminFee / calculationSummary.deathCount : 0

  return (
    <section className='flex w-full min-w-0 flex-col gap-6 overflow-hidden py-8 sm:py-10'>
      <div className='min-w-0'>
        <h1 className='text-xl font-semibold tracking-normal break-words md:text-4xl'>Contribution Calculation</h1>
        <p className='text-muted-foreground mt-2 max-w-4xl text-sm leading-6 break-words sm:text-base'>
          Add deceased loved ones by matriculation number and enter the amount to be contributed. The table pulls the
          name, registration date, and date of death from the deceased loved-one records.
        </p>
      </div>

      <Card className='border-primary/30 bg-primary/10 w-full max-w-full min-w-0 overflow-hidden py-0'>
        <CardHeader className='border-primary/20 min-w-0 border-b py-5'>
          <CardTitle className='text-xl leading-tight break-words'>Add death to contribution calculation</CardTitle>
          <CardDescription className='break-words'>
            Use the SAGICAM matriculation number from the deceased list, then enter the amount for this death.
          </CardDescription>
        </CardHeader>
        <CardContent className='min-w-0 py-5'>
          <FormContainer action={addContributionCalculationDeathAction} className='grid gap-4 md:grid-cols-3 md:items-end'>
            <div className='grid min-w-0 gap-2'>
              <Label htmlFor='memberMatriculationNumber'>Matriculation number</Label>
              <div className='relative'>
                <HeartHandshake className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                <Input
                  id='memberMatriculationNumber'
                  name='memberMatriculationNumber'
                  placeholder='SCABCD123456'
                  className='border-primary/40 bg-background text-foreground pl-9 uppercase'
                  required
                />
              </div>
            </div>

            <div className='grid min-w-0 gap-2'>
              <Label htmlFor='amountToContribute'>Amount to be contributed</Label>
              <div className='relative'>
                <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                <Input
                  id='amountToContribute'
                  name='amountToContribute'
                  type='number'
                  inputMode='decimal'
                  min='0.01'
                  step='0.01'
                  placeholder='0.00'
                  className='border-primary/40 bg-background text-foreground pl-9'
                  required
                />
              </div>
            </div>

            <SubmitButton text='Add To Table' className='h-10 w-full' />
          </FormContainer>
        </CardContent>
      </Card>

      <Card className='w-full max-w-full min-w-0 overflow-hidden'>
        <CardHeader className='min-w-0'>
          <div className='flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between'>
            <div className='min-w-0'>
              <CardTitle className='break-words'>Deaths To Be Contributed</CardTitle>
              <CardDescription className='mt-1 break-words'>
                Review the deaths selected for the current contribution calculation.
              </CardDescription>
            </div>

            <div className='flex flex-wrap gap-2 lg:justify-end'>
              <Badge variant='outline' className='h-9 rounded-md px-3 text-sm font-semibold'>
                {calculationDeaths.length} death{calculationDeaths.length === 1 ? '' : 's'}
              </Badge>
              <Badge variant='secondary' className='h-9 rounded-md px-3 text-sm font-semibold'>
                Deaths: {currencyFormatter.format(calculationSummary.deathAmount)}
              </Badge>
              <Badge variant='secondary' className='h-9 rounded-md px-3 text-sm font-semibold'>
                Total: {currencyFormatter.format(calculationSummary.totalAmount)}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className='min-w-0'>
          <div className='max-w-full overflow-x-auto rounded-lg border'>
            <Table>
              <TableHeader>
                <TableRow className='bg-primary hover:bg-primary'>
                  <TableHead className='text-primary-foreground'>Matriculation</TableHead>
                  <TableHead className='text-primary-foreground'>First Name</TableHead>
                  <TableHead className='text-primary-foreground'>Last and Middle Names</TableHead>
                  <TableHead className='text-primary-foreground'>Registration Date</TableHead>
                  <TableHead className='text-primary-foreground'>Date of Death</TableHead>
                  <TableHead className='text-primary-foreground'>Amount</TableHead>
                  <TableHead className='text-primary-foreground'>Sponsor</TableHead>
                  <TableHead className='text-primary-foreground'>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calculationDeaths.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className='text-muted-foreground h-24 text-center'>
                      No deaths have been added to the contribution calculation.
                    </TableCell>
                  </TableRow>
                ) : (
                  calculationDeaths.map(death => (
                    <TableRow key={death.id} className='odd:bg-muted/30 even:bg-background'>
                      <TableCell className='font-mono text-sm font-semibold'>
                        {death.memberMatriculationNumber}
                      </TableCell>
                      <TableCell className='font-semibold'>{death.firstName}</TableCell>
                      <TableCell className='font-semibold'>{death.lastAndMiddleNames}</TableCell>
                      <TableCell className='whitespace-nowrap'>{formatDate(death.registrationDate)}</TableCell>
                      <TableCell className='whitespace-nowrap'>{formatDate(death.dateOfDeath)}</TableCell>
                      <TableCell className='font-semibold whitespace-nowrap'>
                        {currencyFormatter.format(death.amountToContribute)}
                      </TableCell>
                      <TableCell className='font-mono font-semibold'>{death.sponsorCode}</TableCell>
                      <TableCell>
                        <form action={deleteContributionCalculationDeathAction}>
                          <input type='hidden' name='contributionCalculationDeathId' value={death.id} />
                          <Button type='submit' variant='outline' size='sm' className='text-destructive'>
                            <Trash2 />
                            Remove
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className='mt-5 flex max-w-full flex-col gap-3 rounded-lg border bg-muted/30 p-4 lg:flex-row lg:items-end lg:justify-between'>
            <FormContainer
              action={saveContributionCalculationAdminFeeAction}
              className='flex max-w-full flex-col gap-2 sm:flex-row sm:items-end lg:w-auto'
            >
              <div className='grid min-w-0 gap-2 sm:w-52'>
                <Label htmlFor='adminFee'>Admin Fee</Label>
                <div className='relative'>
                  <DollarSign className='text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2' />
                  <Input
                    id='adminFee'
                    name='adminFee'
                    type='number'
                    inputMode='decimal'
                    min='0.01'
                    step='0.01'
                    placeholder='0.00'
                    defaultValue={calculationSummary.adminFee > 0 ? calculationSummary.adminFee : undefined}
                    className='bg-background pl-9'
                    required
                  />
                </div>
              </div>
              <SubmitButton text='Save Fee' className='h-10 w-full sm:w-auto' />
            </FormContainer>

            <Badge variant='outline' className='h-9 w-fit rounded-md px-3 text-sm font-semibold'>
              Per death: {currencyFormatter.format(adminFeePerDeath)}
            </Badge>

            <Badge variant='secondary' className='h-9 w-fit rounded-md px-3 text-sm font-semibold'>
              Admin: {currencyFormatter.format(calculationSummary.adminFee)} x{' '}
              {calculationSummary.vestedMembersCount} = {currencyFormatter.format(calculationSummary.adminFeeTotal)}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}

export default ContributionCalculationPage
