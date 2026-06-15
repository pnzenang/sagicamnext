import { SponsorRegistrationPaymentSection } from '@/components/dashboard/SponsorPaymentSections'
import { fetchCurrentSponsorRegistrationPayment, fetchMembers } from '@/utils/actions'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RegistrationPayments = async () => {
  const [currentRegistrationPayment, members] = await Promise.all([
    fetchCurrentSponsorRegistrationPayment(),
    fetchMembers()
  ])

  const pendingMembersCount = members.filter(member => member.memberStatus === memberStatus.Pending).length

  return (
    <SponsorRegistrationPaymentSection
      currentRegistrationPayment={currentRegistrationPayment}
      pendingMembersCount={pendingMembersCount}
    />
  )
}

export default RegistrationPayments
