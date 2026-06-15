import Link from 'next/link'

import { ArrowRight, CheckCircle2, CircleDollarSign, FileText, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SponsorContributionPaymentSection } from '@/components/dashboard/SponsorPaymentSections'
import { fetchCurrentSponsorContribution } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const contributionSteps = [
  {
    title: 'Review the contribution amount',
    description:
      'Confirm the current month contribution amount shown on this page for your vested loved ones before sending the payment.'
  },
  {
    title: 'Send the Zelle payment first',
    description:
      'Use the SAGICAM QR code on this page to send the money by Zelle. Add your sponsor code in the Zelle memo and write contribution payment so the payment can be matched to your account.'
  },
  {
    title: 'Record the exact amount sent',
    description:
      'After the Zelle payment has been sent, enter the same dollar amount in the Contribution Amount sent field, then submit Add Contribution Amount Sent.'
  },
  {
    title: 'Review your contribution balance',
    description:
      'The Contribution payment summary will show Amount Sent, Amount Verified by SAGICAM, the amount used for the current contribution, total amount used, any credit, and your remaining balance.'
  }
]

const reminders = [
  'Only enter a contribution amount after you have already sent the Zelle payment.',
  'Use the Contribution Amount sent form for monthly contributions, not for registration fees.',
  'If you send more than the current amount due, the positive balance can be tracked for upcoming contributions.',
  'SAGICAM verifies all submitted payments and may reverse entries that do not match the payment received.'
]

const ContributionsPayments = async () => {
  const currentContribution = await fetchCurrentSponsorContribution()

  return (
    <section className='max-w-9xl mx-auto flex w-full flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <div className='text-primary flex items-center gap-2 text-sm font-semibold uppercase'>
          <CircleDollarSign className='size-4' aria-hidden='true' />
          Contribution Payments
        </div>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-5xl'>Make contribution payments</h1>
        <p className='text-muted-foreground max-w-3xl text-base leading-7 sm:text-lg'>
          Use this page for monthly contribution payments only. Send the Zelle payment first, then record the exact
          amount you sent so SAGICAM can verify it.
        </p>
        <Button asChild className='w-fit'>
          <Link href='/all-members'>
            View All Loved Ones
            <ArrowRight aria-hidden='true' />
          </Link>
        </Button>
      </div>

      <SponsorContributionPaymentSection currentContribution={currentContribution} />

      <div className='grid gap-4 md:grid-cols-2'>
        {contributionSteps.map((step, index) => (
          <Card key={step.title} className='rounded-md'>
            <CardHeader>
              <CardTitle className='flex items-start gap-3 text-xl'>
                <span className='bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-md text-sm'>
                  {index + 1}
                </span>
                {step.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className='text-muted-foreground text-base leading-7'>{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className='grid gap-4 lg:grid-cols-[1fr_1fr]'>
        <div className='rounded-md border p-5'>
          <div className='mb-3 flex items-center gap-2 font-semibold'>
            <FileText className='text-primary size-5' aria-hidden='true' />
            What to use on this page
          </div>
          <p className='text-muted-foreground text-base leading-7'>
            This page shows the current month contribution for your vested loved ones. It also includes the SAGICAM
            Zelle QR code, the Contribution Amount sent form, and a summary that tracks what you sent, what SAGICAM
            verified, what was used for contributions, and any remaining balance or credit.
          </p>
        </div>

        <div className='rounded-md border p-5'>
          <div className='mb-3 flex items-center gap-2 font-semibold'>
            <ShieldCheck className='text-primary size-5' aria-hidden='true' />
            Important reminders
          </div>
          <div className='grid gap-3'>
            {reminders.map(reminder => (
              <div key={reminder} className='text-muted-foreground flex items-start gap-2'>
                <CheckCircle2 className='text-primary mt-0.5 size-4 shrink-0' aria-hidden='true' />
                <p className='text-sm leading-6'>{reminder}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContributionsPayments
