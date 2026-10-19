import type { ReactNode } from 'react'

import Image from 'next/image'
import Link from 'next/link'

import {
  AlertTriangle,
  ArrowLeft,
  Banknote,
  Building2,
  Landmark,
  Mail,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  type LucideIcon
} from 'lucide-react'

import {
  getSagicamPaymentMemo,
  sagicamBankDetails,
  sagicamBusinessName,
  sagicamZelleEmail,
  sagicamZellePaymentUrl,
  sagicamZelleQrCodeUrl,
  type PaymentCenterMethod,
  type PaymentCenterType
} from '@/utils/sagicam-payment-details'

const highlightClassName = 'font-bold text-green-700 dark:text-green-300'
const infoCardClassName = 'bg-primary/5 h-full rounded-lg p-3 ring-1 ring-primary/15'
const stepTextClassName = 'text-primary/80 text-left text-base leading-snug font-normal sm:text-lg lg:text-xl'

const paymentTypeLabels: Record<PaymentCenterType, string> = {
  contribution: 'Contribution',
  registration: 'Registration'
}

const paymentMethodLabels: Record<PaymentCenterMethod, string> = {
  'bank-deposit': 'Bank Deposit',
  zelle: 'Zelle'
}

const iconToneClassNames = {
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  green: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-300',
  primary: 'bg-primary/10 text-primary'
} as const

const InfoCard = ({
  children,
  icon: Icon,
  title,
  tone = 'primary'
}: {
  children: ReactNode
  icon: LucideIcon
  title: string
  tone?: keyof typeof iconToneClassNames
}) => (
  <div className={infoCardClassName}>
    <div className='flex items-center gap-2'>
      <span className={`flex size-8 shrink-0 items-center justify-center rounded-md ${iconToneClassNames[tone]}`}>
        <Icon className='size-4' aria-hidden='true' />
      </span>
      <h2 className='text-primary text-base leading-tight font-semibold sm:text-lg'>{title}</h2>
    </div>
    <p className='text-primary/80 mt-2 text-sm leading-snug font-normal break-words sm:text-base'>{children}</p>
  </div>
)

const ZelleInfoCards = ({ memo }: { memo: string }) => (
  <>
    <div className='grid gap-3 md:grid-cols-[1fr_1fr_auto]'>
      <div className='grid gap-3'>
        <InfoCard icon={Smartphone} title='Use your bank app'>
          Use the Zelle option inside your bank or credit union app, online portal, or transfer menu.
        </InfoCard>
        <InfoCard icon={Mail} title='SAGICAM Zelle email'>
          Send to <span className={highlightClassName}>{sagicamZelleEmail}</span> after selecting payment to a
          business. Recipient name: <span className={highlightClassName}>{sagicamBusinessName}</span>.
        </InfoCard>
      </div>
      <div className='grid gap-3'>
        <InfoCard icon={ReceiptText} title='4-letter memo'>
          Add <span className={highlightClassName}>{memo}</span> in the memo so your payment can be matched to your
          sponsor account.
        </InfoCard>
        <InfoCard icon={Banknote} title='Treat Zelle like cash' tone='green'>
          Money goes directly into the recipient&apos;s bank account. Always double check the email and recipient name
          before sending.
        </InfoCard>
      </div>
      <Link
        href={sagicamZellePaymentUrl}
        aria-label='Open SAGICAM Zelle payment information'
        className='bg-background hover:border-primary flex items-center justify-center rounded-lg border p-2 transition'
      >
        <Image
          src={sagicamZelleQrCodeUrl}
          width={220}
          height={220}
          alt='SAGICAM Zelle payment QR code'
          className='h-auto w-full max-w-56'
        />
      </Link>
    </div>
    <div className='mt-3'>
      <InfoCard icon={AlertTriangle} title='Beware of payment scams' tone='amber'>
        Zelle is fast, so slow down and watch for signs of a scam. If you notice suspicious activity, contact your bank
        directly.
      </InfoCard>
    </div>
  </>
)

const ZelleSteps = ({ memo }: { memo: string }) => (
  <>
    <p className={stepTextClassName}>
      1. Open your banking app: sign in to your bank or credit union&apos;s mobile app or online portal where Zelle is
      built in, or scan the QR code above.
    </p>
    <p className={stepTextClassName}>
      2. Navigate to Zelle: look for a menu labeled &quot;Send Money with Zelle&quot;, &quot;Pay &amp; Transfer&quot;,
      or &quot;Move Money&quot;.
    </p>
    <p className={stepTextClassName}>
      3. Select to send money to a business and enter the SAGICAM email:{' '}
      <span className={highlightClassName}>{sagicamZelleEmail}</span>.
    </p>
    <p className={stepTextClassName}>
      4. Verify the recipient name is <span className={highlightClassName}>{sagicamBusinessName}</span>.
    </p>
    <p className={stepTextClassName}>
      5. Enter the amount and memo: type the dollar amount and enter{' '}
      <span className={highlightClassName}>{memo}</span> as the note or memo. Without the 4-letter code memo, the money
      won&apos;t be recognizable until you send the receipt including your 4-letter code.
    </p>
  </>
)

const BankDepositInfoCards = ({ memo }: { memo: string }) => (
  <>
    <div className='grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
      <InfoCard icon={Building2} title='Bank'>
        Deposit or transfer SAGICAM payments through{' '}
        <span className={highlightClassName}>{sagicamBankDetails.bankName}</span>. Account number:{' '}
        <span className={highlightClassName}>{sagicamBankDetails.accountNumber}</span>
      </InfoCard>
      <InfoCard icon={Landmark} title='Paper & Electronic'>
        Routing number: <span className={highlightClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span>
      </InfoCard>
      <InfoCard icon={Banknote} title='Wires'>
        Routing number: <span className={highlightClassName}>{sagicamBankDetails.wireRoutingNumber}</span>
      </InfoCard>
      <InfoCard icon={ReceiptText} title='4-letter memo'>
        Add <span className={highlightClassName}>{memo}</span> in the memo so your payment can be matched to your
        sponsor account.
      </InfoCard>
    </div>
    <div className='mt-3 grid gap-3 md:grid-cols-3'>
      <InfoCard icon={ShieldCheck} title='Confirm the account'>
        Verify the SAGICAM bank account details before sending a bank deposit, ACH transfer, or wire.
      </InfoCard>
      <InfoCard icon={AlertTriangle} title='Use the right routing number' tone='amber'>
        Use <span className={highlightClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span> for
        paper/electronic transfers and <span className={highlightClassName}>{sagicamBankDetails.wireRoutingNumber}</span>{' '}
        for wires.
      </InfoCard>
      <InfoCard icon={ReceiptText} title='Keep your receipt' tone='green'>
        Save the deposit slip, confirmation, or wire receipt so SAGICAM can verify your payment if needed.
      </InfoCard>
    </div>
  </>
)

const BankDepositSteps = ({ memo }: { memo: string }) => (
  <>
    <p className={stepTextClassName}>
      1. Choose your bank payment method: paper/electronic transfer, wire transfer, or deposit at the bank.
    </p>
    <p className={stepTextClassName}>
      2. To deposit at the bank, go to a <span className={highlightClassName}>{sagicamBankDetails.bankName}</span>{' '}
      branch and fill the deposit slip with the business name{' '}
      <span className={highlightClassName}>{sagicamBankDetails.businessName}</span> and account number{' '}
      <span className={highlightClassName}>{sagicamBankDetails.accountNumber}</span>.
    </p>
    <p className={stepTextClassName}>
      3. For a transfer, use routing number{' '}
      <span className={highlightClassName}>{sagicamBankDetails.paperElectronicRoutingNumber}</span> for paper &amp;
      electronic, or <span className={highlightClassName}>{sagicamBankDetails.wireRoutingNumber}</span> for wires.
    </p>
    <p className={stepTextClassName}>
      4. Verify the bank information: double-check the bank name, routing number, account number, and amount before
      sending.
    </p>
    <p className={stepTextClassName}>
      5. Add a note or memo: enter <span className={highlightClassName}>{memo}</span>. Without the 4-letter code memo,
      the money won&apos;t be recognizable until you send the receipt including your 4-letter code.
    </p>
  </>
)

type PaymentMethodInstructionsProps = {
  paymentForm: ReactNode
  paymentMethod: PaymentCenterMethod
  paymentType: PaymentCenterType
  sponsorCode: string
}

const PaymentMethodInstructions = ({
  paymentForm,
  paymentMethod,
  paymentType,
  sponsorCode
}: PaymentMethodInstructionsProps) => {
  const memo = getSagicamPaymentMemo(sponsorCode)
  const methodLabel = paymentMethodLabels[paymentMethod]

  return (
    <section className='mx-auto grid w-full max-w-[90rem] min-w-0 gap-5 px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <Link
        href='/payment-center'
        className='text-primary inline-flex w-fit items-center gap-1.5 text-sm font-bold underline-offset-4 hover:underline'
      >
        <ArrowLeft className='size-4' aria-hidden='true' />
        Back to Payment Center
      </Link>

      <div className='border-primary/20 bg-primary/10 text-primary rounded-lg border p-3 shadow-sm sm:p-6'>
        <h1 className='text-center text-xl leading-tight font-semibold break-words sm:text-2xl lg:text-3xl'>
          {sponsorCode} Sponsor, welcome to SAGICAM&apos;s {methodLabel} {paymentTypeLabels[paymentType]} Payment
          page.
        </h1>

        <div className='border-primary/30 bg-background mt-6 rounded-lg border p-3 text-left shadow-sm sm:p-4'>
          {paymentMethod === 'zelle' ? <ZelleInfoCards memo={memo} /> : <BankDepositInfoCards memo={memo} />}
        </div>

        <p className='text-primary/80 mt-6 text-center text-base font-medium break-words sm:text-lg lg:text-xl'>
          To successfully make a {methodLabel} payment to SAGICAM, follow the two step process below.
        </p>

        <div className='border-primary/30 bg-background mt-6 grid gap-3 rounded-lg border p-4 shadow-sm sm:p-6'>
          <p className='text-center text-xl leading-tight font-semibold break-words sm:text-2xl lg:text-3xl'>
            Step 1: Send the payment by {methodLabel}.
          </p>
          {paymentMethod === 'zelle' ? <ZelleSteps memo={memo} /> : <BankDepositSteps memo={memo} />}
        </div>

        <div className='border-primary/30 bg-background mt-6 rounded-lg border p-4 shadow-sm sm:p-6'>
          <p className='text-center text-xl leading-tight font-semibold break-words sm:text-2xl lg:text-3xl'>
            Step 2: Record the amount you sent.
          </p>
          <div className='mx-auto mt-4 w-full max-w-xl'>{paymentForm}</div>
        </div>
      </div>
    </section>
  )
}

export default PaymentMethodInstructions
