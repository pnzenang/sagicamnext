import {
  fetchCurrentSponsorContribution,
  fetchCurrentSponsorRegistrationPayment,
  fetchMembers
} from '@/utils/actions'
import { memberStatus } from '@/utils/types'

import PaymentCenter from './PaymentCenter'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const PaymentCenterPage = async () => {
  const [currentContribution, currentRegistrationPayment, members] = await Promise.all([
    fetchCurrentSponsorContribution(),
    fetchCurrentSponsorRegistrationPayment(),
    fetchMembers()
  ])

  const pendingMembersCount = members.filter(member => member.memberStatus === memberStatus.Pending).length

  return (
    <PaymentCenter
      contributionAmountOwed={currentContribution.amountOwed}
      contributionAmountPerVestedMember={currentContribution.amountPerVestedMember}
      contributionVestedMembersCount={currentContribution.vestedMembersCount}
      pendingRegistrationMembersCount={pendingMembersCount}
      sponsorCode={currentContribution.sponsorCode}
    />
  )
}

export default PaymentCenterPage
