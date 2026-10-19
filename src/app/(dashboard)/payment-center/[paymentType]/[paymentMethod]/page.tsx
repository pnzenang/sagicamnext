import { notFound } from 'next/navigation'

import SponsorContributionPaymentCard from '@/components/dashboard/SponsorContributionPaymentCard'
import SponsorRegistrationPaymentCard from '@/components/dashboard/SponsorRegistrationPaymentCard'
import { getRegistrationPaymentAmount } from '@/components/dashboard/SponsorPaymentSections'
import {
  fetchCurrentSponsorContribution,
  fetchCurrentSponsorRegistrationPayment,
  fetchMembers
} from '@/utils/actions'
import { isPaymentCenterMethod, isPaymentCenterType } from '@/utils/sagicam-payment-details'
import { memberStatus } from '@/utils/types'

import PaymentMethodInstructions from '../../PaymentMethodInstructions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PaymentMethodPageProps = {
  params: Promise<{
    paymentMethod: string
    paymentType: string
  }>
}

const PaymentMethodPage = async ({ params }: PaymentMethodPageProps) => {
  const { paymentMethod, paymentType } = await params

  if (!isPaymentCenterType(paymentType) || !isPaymentCenterMethod(paymentMethod)) notFound()

  if (paymentType === 'contribution') {
    const currentContribution = await fetchCurrentSponsorContribution()

    return (
      <PaymentMethodInstructions
        paymentForm={
          <SponsorContributionPaymentCard
            amountExpected={currentContribution.amountOwed}
            amountSent={Math.max(currentContribution.amountReceived, currentContribution.amountVerified)}
          />
        }
        paymentMethod={paymentMethod}
        sponsorCode={currentContribution.sponsorCode}
      />
    )
  }

  const [currentRegistrationPayment, members] = await Promise.all([
    fetchCurrentSponsorRegistrationPayment(),
    fetchMembers()
  ])

  const pendingMembersCount = members.filter(member => member.memberStatus === memberStatus.Pending).length

  return (
    <PaymentMethodInstructions
      paymentForm={
        <SponsorRegistrationPaymentCard
          amountExpected={getRegistrationPaymentAmount(pendingMembersCount)}
          amountSent={Math.max(currentRegistrationPayment.amountReceived, currentRegistrationPayment.amountVerified)}
        />
      }
      paymentMethod={paymentMethod}
      sponsorCode={currentRegistrationPayment.sponsorCode}
    />
  )
}

export default PaymentMethodPage
