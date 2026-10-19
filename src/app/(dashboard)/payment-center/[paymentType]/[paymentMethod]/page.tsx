import { notFound } from 'next/navigation'

import { fetchProfile } from '@/utils/actions'
import { isPaymentCenterMethod, parsePaymentCenterTypeSegment } from '@/utils/sagicam-payment-details'

import PaymentMethodInstructions from '../../PaymentMethodInstructions'
import ZellePaymentAmountForm from '../../ZellePaymentAmountForm'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PaymentMethodPageProps = {
  params: Promise<{
    paymentMethod: string
    paymentType: string
  }>
}

const PaymentMethodPage = async ({ params }: PaymentMethodPageProps) => {
  const { paymentMethod, paymentType: paymentTypeSegment } = await params
  const paymentType = parsePaymentCenterTypeSegment(paymentTypeSegment)

  if (!paymentType || !isPaymentCenterMethod(paymentMethod)) notFound()

  const profile = await fetchProfile()

  return (
    <PaymentMethodInstructions
      paymentForm={<ZellePaymentAmountForm paymentType={paymentType} />}
      paymentMethod={paymentMethod}
      sponsorCode={profile.sponsorCode}
    />
  )
}

export default PaymentMethodPage
