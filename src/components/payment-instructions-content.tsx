import Image from 'next/image'
import Link from 'next/link'

import { ArrowRight, CheckCircle2, CreditCard, FileText, ShieldCheck, Upload, WalletCards } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

const zellePaymentLink =
  'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'

const sagicamQrCodeUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'

const reminders = [
  'Confirm the amount before sending payment.',
  'Always include your SAGICAM sponsor memo when making a payment.',
  'Use the same sponsor code that appears in your SAGICAM dashboard.',
  'Keep your Zelle confirmation until the payment is reflected in SAGICAM.',
  'Do not combine registration and contribution payments without writing a clear memo.'
]

const getPaymentSteps = (memoReference: string) => [
  {
    icon: WalletCards,
    title: 'Open the right payment page',
    description: 'Use Registration Payments for new loved one fees and Contributions Payments for monthly contributions.'
  },
  {
    icon: CreditCard,
    title: 'Send the money with Zelle',
    description:
      'Scan the QR code or click it to open the SAGICAM Zelle payment information, then send the exact amount required.'
  },
  {
    icon: FileText,
    title: 'Write a clear payment memo',
    description: `Always include ${memoReference} in the Zelle memo so SAGICAM can match the payment to your account.`
  },
  {
    icon: Upload,
    title: 'Record the payment in SAGICAM',
    description: 'Return to the matching payment page, enter the exact amount sent, and submit it for verification.'
  }
]

const PaymentInstructionsContent = ({ sponsorCode }: { sponsorCode?: string | null }) => {
  const memoReference = sponsorCode ? `SAGICAM-${sponsorCode}` : 'SAGICAM-[your sponsor code]'
  const paymentSteps = getPaymentSteps(memoReference)

  return (
    <section className='mx-auto flex w-full max-w-7xl flex-col gap-6 px-2 py-4 sm:px-4 sm:py-6'>
      <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-stretch'>
        <div className='bg-card flex flex-col justify-center rounded-lg border p-5 shadow-sm sm:p-8'>
          <Badge className='mb-4 w-fit' variant='secondary'>
            Payment Instructions
          </Badge>
          <h1 className='text-foreground max-w-3xl text-3xl font-semibold tracking-normal break-words sm:text-4xl'>
            How to make and record a SAGICAM payment
          </h1>
          <p className='text-muted-foreground mt-4 max-w-3xl text-base leading-7'>
            Send your payment first, then record it in the correct SAGICAM payment page so the admin team can match the
            money to your sponsor account without delays.{' '}
            <span className='text-primary font-bold'>Always include {memoReference} in the payment memo.</span>
          </p>
          <div className='mt-6 flex flex-col gap-3 sm:flex-row'>
            <Button asChild>
              <Link href='/contributions-payments'>
                Contributions Payments
                <ArrowRight className='size-4' />
              </Link>
            </Button>
            <Button asChild variant='outline'>
              <Link href='/registration-payments'>Registration Payments</Link>
            </Button>
          </div>
        </div>

        <Card className='overflow-hidden'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CreditCard className='text-primary size-5' />
              Zelle Payment
            </CardTitle>
            <CardDescription>
              Send Zelle payment using:
              <br /> SAGICAM name:<span className='font-bold'> Active Solidarity Ltd</span> and email:{' '}
              <span className='font-bold'>info@sagiusa.org</span>
              <br />
              or click the QR code to search your bank and connect the Zelle payment.
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center gap-4'>
            <Link
              aria-label='Open SAGICAM Zelle payment information'
              className='bg-background hover:border-primary rounded-lg border p-4 transition'
              href={zellePaymentLink}
            >
              <Image
                alt='SAGICAM Zelle payment QR code'
                className='h-auto w-full max-w-64'
                height={300}
                priority
                src={sagicamQrCodeUrl}
                width={300}
              />
            </Link>
            <p className='text-muted-foreground text-center text-sm'>
              After sending, come back to SAGICAM and submit the payment record in Registration Payments or
              Contributions Payments.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {paymentSteps.map((step, index) => {
          const Icon = step.icon

          return (
            <Card key={step.title}>
              <CardHeader>
                <div className='bg-primary/10 text-primary mb-3 flex size-11 items-center justify-center rounded-md'>
                  <Icon className='size-5' />
                </div>
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle className='text-lg leading-tight'>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className='text-muted-foreground text-sm leading-6'>{step.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ShieldCheck className='text-primary size-5' />
            Before You Submit
          </CardTitle>
          <CardDescription>
            Use these checks to prevent a payment from being delayed or hard to identify.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className='grid gap-3 sm:grid-cols-2'>
            {reminders.map(reminder => (
              <li className='text-muted-foreground flex gap-3 text-sm leading-6' key={reminder}>
                <CheckCircle2 className='text-primary mt-0.5 size-5 shrink-0' />
                <span>{reminder}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </section>
  )
}

export default PaymentInstructionsContent
