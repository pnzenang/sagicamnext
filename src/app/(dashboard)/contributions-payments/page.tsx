import Link from 'next/link'

import { ArrowRight, CheckCircle2, CircleDollarSign, FileText, ShieldCheck } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const contributionSteps = [
  {
    title: 'Open All Loved Ones',
    description:
      'Go to Sponsor Pages, then open All Loved Ones. At the top of that page, review the current month contribution amount for your vested loved ones.'
  },
  {
    title: 'Send the Zelle payment first',
    description:
      'Use the SAGICAM QR code on the All Loved Ones page to send the money by Zelle. Add your sponsor code in the Zelle memo and write contribution payment so the payment can be matched to your account.'
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

const ContributionsPayments = () => {
  return (
    <section className='mx-auto flex w-full max-w-9xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8'>
      <div className='space-y-3'>
        <div className='text-primary flex items-center gap-2 text-sm font-semibold uppercase'>
          <CircleDollarSign className='size-4' aria-hidden='true' />
          Contribution Payments
        </div>
        <h1 className='text-3xl font-semibold tracking-normal sm:text-5xl'>Make contribution payments from All Loved Ones</h1>
        <p className='text-muted-foreground max-w-3xl text-base leading-7 sm:text-lg'>
          Contribution payments are now handled from the All Loved Ones page. Use this page as a guide, then go to All
          Loved Ones to send your Zelle payment, record the amount you sent, and follow SAGICAM verification.
        </p>
        <Button asChild className='w-fit'>
          <Link href='/all-members'>
            Go to All Loved Ones
            <ArrowRight aria-hidden='true' />
          </Link>
        </Button>
      </div>

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
            What to look for on All Loved Ones
          </div>
          <p className='text-muted-foreground text-base leading-7'>
            The All Loved Ones page shows the current month contribution for your vested loved ones. It also includes
            the SAGICAM Zelle QR code, the Contribution Amount sent form, and a summary that tracks what you sent, what
            SAGICAM verified, what was used for contributions, and any remaining balance or credit.
          </p>
        </div>

        <div className='rounded-md border p-5'>
          <div className='mb-3 flex items-center gap-2 font-semibold'>
            <ShieldCheck className='text-primary size-5' aria-hidden='true' />
            Important reminders
          </div>
          <div className='grid gap-3'>
            {reminders.map(reminder => (
              <div key={reminder} className='flex items-start gap-2 text-muted-foreground'>
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
