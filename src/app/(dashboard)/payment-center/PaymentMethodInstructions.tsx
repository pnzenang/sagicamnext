import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  AlertTriangle,
  Banknote,
  Building2,
  Landmark,
  Mail,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Zap
} from 'lucide-react'

import {
  getSagicamPaymentMemo,
  sagicamBankDetails,
  sagicamBusinessName,
  sagicamZelleEmail,
  sagicamZellePaymentUrl,
  sagicamZelleQrCodeUrl,
  type PaymentCenterMethod
} from '@/utils/sagicam-payment-details'

const sagicamInfoClassName = 'font-bold text-green-700 dark:text-green-300'
const cardClassName = 'bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'
const cardTitleClassName = 'text-primary text-base leading-tight font-semibold sm:text-lg lg:text-xl'
const cardTextClassName = 'text-primary/80 mt-2 text-sm leading-snug font-normal sm:text-base'
const stepTextClassName = 'text-primary/80 mt-3 text-left text-lg leading-snug font-normal sm:text-xl lg:text-2xl'
const stepTitleClassName = 'text-[clamp(1rem,3vw,2.25rem)] leading-tight font-semibold whitespace-nowrap'
const primaryIconClassName = 'bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-md'

const amberIconClassName =
  'flex size-8 shrink-0 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'

const greenIconClassName =
  'flex size-8 shrink-0 items-center justify-center rounded-md bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300'

const paymentMethodLabels: Record<PaymentCenterMethod, string> = {
  'bank-deposit': 'Bank Deposit',
  zelle: 'Zelle'
}

const MemoCard = ({ memo }: { memo: string }) => (
  <div className={cardClassName}>
    <span className={primaryIconClassName}>
      <ReceiptText className='size-4' aria-hidden='true' />
    </span>
    <p className={`${cardTitleClassName} mt-2`}>4-letter memo</p>
    <p className={cardTextClassName}>
      Add <span className={sagicamInfoClassName}>{memo}</span> in the memo so your payment can be matched to your
      sponsor account.
    </p>
  </div>
)

const zelleFeatures = [
  {
    description: 'Money is usually available within minutes when both sides are enrolled with Zelle.',
    icon: Zap,
    title: 'Fast transfer'
  },
  {
    description: 'Use the Zelle option inside your bank or credit union app, online portal, or transfer menu.',
    icon: Smartphone,
    title: 'Use your bank app'
  }
] as const

const ZelleInfoCards = ({ memo }: { memo: string }) => (
  <>
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      {zelleFeatures.map(feature => (
        <div key={feature.title} className={cardClassName}>
          <span className={primaryIconClassName}>
            <feature.icon className='size-4' aria-hidden='true' />
          </span>
          <p className={`${cardTitleClassName} mt-2`}>{feature.title}</p>
          <p className={cardTextClassName}>{feature.description}</p>
        </div>
      ))}

      <div className={cardClassName}>
        <span className={primaryIconClassName}>
          <Mail className='size-4' aria-hidden='true' />
        </span>
        <p className={`${cardTitleClassName} mt-2`}>SAGICAM email</p>
        <p className={cardTextClassName}>
          Send SAGICAM payments to <span className={sagicamInfoClassName}>{sagicamZelleEmail}</span> after selecting
          payment to a business.
        </p>
      </div>

      <MemoCard memo={memo} />
    </div>

    <div className='mt-3 grid w-full items-stretch gap-3 md:grid-cols-3'>
      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={primaryIconClassName}>
            <ShieldCheck className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Only Send Money to Those You Trust</h2>
        </div>
        <p className={cardTextClassName}>
          With Zelle&reg;, you can send money from your account to someone else&apos;s within minutes<sup>1</sup>.
          It&apos;s a great way to pay friends, family, your co-workers and others you trust, even if they bank
          somewhere different than you do<sup>1</sup>.
        </p>
      </div>

      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={amberIconClassName}>
            <AlertTriangle className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Beware of Payment Scams</h2>
        </div>
        <p className={cardTextClassName}>
          While using Zelle&reg; is a fast way to send money, it&apos;s important to slow down and keep an eye out for
          signs of a scam. If you detect suspicious activity, contact your financial institution directly.
        </p>
      </div>

      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={greenIconClassName}>
            <Banknote className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Treat Zelle&reg; Like Cash</h2>
        </div>
        <p className={cardTextClassName}>
          With Zelle&reg;, money goes directly into the enrolled recipient&apos;s bank account. Always double check you
          have the recipient&apos;s correct U.S. mobile number, email address, or Zelle&reg; Tag so the money goes to
          the right person or small business.
        </p>
      </div>
    </div>
  </>
)

const ZelleSteps = ({ memo }: { memo: string }) => (
  <>
    <p className={stepTitleClassName}>Step1: Register SAGICAM Zelle information.</p>
    <div className='mt-4 grid items-stretch gap-6 lg:grid-cols-[1fr_auto_1fr]'>
      <div>
        <p className={stepTextClassName.replace('mt-3 ', '')}>
          1. Open your banking app: Sign in to your bank or credit union&apos;s mobile app or online portal where Zelle
          is built-in.
        </p>
        <p className={stepTextClassName}>
          2. Navigate to Zelle: Look for a menu labeled &quot;Send Money with Zelle&quot;, &quot;Pay &amp;
          Transfer&quot;, or &quot;Move Money&quot;.
        </p>
        <p className={stepTextClassName}>
          3. Select to send money to a business and enter SAGICAM email:{' '}
          <span className={sagicamInfoClassName}>{sagicamZelleEmail}</span>.
        </p>
        <p className={stepTextClassName}>
          4. Verify the recipient name: Double-check that the recipient&apos;s is:{' '}
          <span className={sagicamInfoClassName}>{sagicamBusinessName}.</span>
        </p>
        <p className={stepTextClassName}>
          5. Enter the amount and memo: Type in the dollar amount you wish to send and enter as note or memo:
          <span className={sagicamInfoClassName}> {memo}</span>. Without the 4-letter code memo, the money won&apos;t
          be recognizable until you send the receipt including your 4-letter code.
        </p>
      </div>

      <div className='flex items-center gap-3 lg:flex-col' aria-hidden='true'>
        <span className='bg-primary/30 h-px flex-1 lg:h-auto lg:w-px' />
        <span className='border-primary/30 bg-primary/10 text-primary flex size-12 shrink-0 items-center justify-center rounded-full border text-base font-extrabold sm:text-lg'>
          OR
        </span>
        <span className='bg-primary/30 h-px flex-1 lg:h-auto lg:w-px' />
      </div>

      <div className='border-primary/20 bg-primary/5 flex flex-col items-center justify-between gap-3 rounded-lg border p-4'>
        <p className='text-primary/80 text-base leading-snug font-medium sm:text-lg'>
          Scan or click the QR code to send payment by Zelle. Add <span className={sagicamInfoClassName}>{memo}</span>{' '}
          in the memo.
        </p>
        <Link href={sagicamZellePaymentUrl} target='_blank' rel='noopener noreferrer'>
          <Image
            src={sagicamZelleQrCodeUrl}
            width={1062}
            height={1009}
            alt='SAGICAM Zelle payment QR code'
            className='h-auto w-full max-w-72 sm:max-w-80'
            unoptimized
          />
        </Link>
      </div>
    </div>
  </>
)

const BankDepositInfoCards = ({ memo }: { memo: string }) => (
  <>
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      <div className={cardClassName}>
        <span className={primaryIconClassName}>
          <Building2 className='size-4' aria-hidden='true' />
        </span>
        <p className={`${cardTitleClassName} mt-2`}>Bank</p>
        <p className={cardTextClassName}>
          Deposit or transfer SAGICAM payments through{' '}
          <span className={sagicamInfoClassName}>{sagicamBankDetails.bankName}</span>. Account number:{' '}
          <span className={sagicamInfoClassName}>{sagicamBankDetails.accountNumber}</span>
        </p>
      </div>

      <div className={cardClassName}>
        <span className={primaryIconClassName}>
          <Landmark className='size-4' aria-hidden='true' />
        </span>
        <p className={`${cardTitleClassName} mt-2`}>Paper &amp; Electronic</p>
        <p className={cardTextClassName}>
          Routing number: <span className={sagicamInfoClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span>
        </p>
      </div>

      <div className={cardClassName}>
        <span className={primaryIconClassName}>
          <Banknote className='size-4' aria-hidden='true' />
        </span>
        <p className={`${cardTitleClassName} mt-2`}>Wires</p>
        <p className={cardTextClassName}>
          Routing number: <span className={sagicamInfoClassName}>{sagicamBankDetails.wireRoutingNumber}</span>
        </p>
      </div>

      <MemoCard memo={memo} />
    </div>

    <div className='mt-3 grid w-full items-stretch gap-3 md:grid-cols-3'>
      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={primaryIconClassName}>
            <ShieldCheck className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Confirm the account</h2>
        </div>
        <p className={cardTextClassName}>
          Verify the SAGICAM bank account details before sending a bank deposit, ACH transfer, or wire.
        </p>
      </div>

      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={amberIconClassName}>
            <AlertTriangle className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Use the right routing number</h2>
        </div>
        <p className={cardTextClassName}>
          Use <span className={sagicamInfoClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span> for
          paper/electronic transfers and{' '}
          <span className={sagicamInfoClassName}>{sagicamBankDetails.wireRoutingNumber}</span> for wires.
        </p>
      </div>

      <div className={cardClassName}>
        <div className='flex items-center gap-2'>
          <span className={greenIconClassName}>
            <ReceiptText className='size-4' aria-hidden='true' />
          </span>
          <h2 className={cardTitleClassName}>Keep your receipt</h2>
        </div>
        <p className={cardTextClassName}>
          Save the deposit slip, confirmation, or wire receipt so SAGICAM can verify your payment if needed.
        </p>
      </div>
    </div>
  </>
)

const BankDepositSteps = ({ memo }: { memo: string }) => (
  <>
    <p className={stepTitleClassName}>Step1: Register SAGICAM Bank Deposit information.</p>
    <p className={stepTextClassName.replace('mt-3', 'mt-4')}>
      1. Choose your bank payment method: Use paper/electronic transfer, wire transfer, or deposit at the bank.
    </p>
    <p className={stepTextClassName}>
      2. If you want to deposit at the bank, go to a{' '}
      <span className={sagicamInfoClassName}>{sagicamBankDetails.bankName}</span> branch and fill the deposit slip with
      the business name <span className={sagicamInfoClassName}>{sagicamBankDetails.businessName}</span> and account
      number <span className={sagicamInfoClassName}>{sagicamBankDetails.accountNumber}</span>.
    </p>
    <p className={stepTextClassName}>
      3. For Transfer, use the Routing Number:{' '}
      <span className={sagicamInfoClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span> for Paper &amp;
      Electronic, or <span className={sagicamInfoClassName}>{sagicamBankDetails.wireRoutingNumber}</span> for Wires.
    </p>
    <p className={stepTextClassName}>
      4. Verify the bank information: Double-check the bank name, routing number, account information, and amount
      before sending.
    </p>
    <p className={stepTextClassName}>
      5. Add a note or memo: Enter <span className={sagicamInfoClassName}>{memo}</span>. Without the 4-letter code
      memo, the money won&apos;t be recognizable until you send the receipt including your 4-letter code.
    </p>
  </>
)

type PaymentMethodInstructionsProps = {
  paymentForm: ReactNode
  paymentMethod: PaymentCenterMethod
  sponsorCode: string
}

const PaymentMethodInstructions = ({ paymentForm, paymentMethod, sponsorCode }: PaymentMethodInstructionsProps) => {
  const memo = getSagicamPaymentMemo(sponsorCode)
  const methodLabel = paymentMethodLabels[paymentMethod]

  return (
    <main className='flex min-h-[calc(100vh-8rem)] w-full justify-center px-1 pt-2 pb-8 sm:px-2 sm:pt-4'>
      <section className='border-primary/20 bg-primary/10 text-primary w-full max-w-[120rem] rounded-lg border p-3 text-center shadow-sm sm:p-6 lg:p-10'>
        <h1 className='text-[10px] leading-tight font-semibold tracking-normal whitespace-nowrap sm:text-base md:text-xl lg:text-2xl xl:text-3xl'>
          {sponsorCode} Sponsor, Welcome to SAGICAM&apos;s {methodLabel} Payment page.
        </h1>

        <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
          {paymentMethod === 'zelle' ? <ZelleInfoCards memo={memo} /> : <BankDepositInfoCards memo={memo} />}
        </div>

        <p className='text-primary/80 mt-6 text-[8px] leading-snug font-medium whitespace-nowrap sm:text-xs md:text-lg lg:text-2xl xl:text-3xl'>
          To successfully make {methodLabel} payment to SAGICAM, follow the two step process below.
        </p>

        <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
          {paymentMethod === 'zelle' ? <ZelleSteps memo={memo} /> : <BankDepositSteps memo={memo} />}
        </div>

        <div className='border-primary/30 bg-background mt-8 rounded-lg border p-4 text-center shadow-sm sm:p-6'>
          <p className={stepTitleClassName}>Step2: Complete the form below:</p>
          {paymentForm}
        </div>
      </section>
    </main>
  )
}

export default PaymentMethodInstructions
