import { SponsorRegistrationPaymentSection } from '@/components/dashboard/SponsorPaymentSections'
import { fetchCurrentSponsorRegistrationPayment, fetchMembers } from '@/utils/actions'
import { fetchSponsorPaymentLedgerEntries, sponsorPaymentTypes } from '@/utils/sagicam-payment-ledger'
import { memberStatus } from '@/utils/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const RegistrationPayments = async () => {
  const [currentRegistrationPayment, members] = await Promise.all([
    fetchCurrentSponsorRegistrationPayment(),
    fetchMembers()
  ])

  const ledgerEntries = await fetchSponsorPaymentLedgerEntries(currentRegistrationPayment.sponsorCode, {
    noStore: true,
    paymentType: sponsorPaymentTypes.registration
  })

  const pendingMembersCount = members.filter(member => member.memberStatus === memberStatus.Pending).length

  return (
    <SponsorRegistrationPaymentSection
      currentRegistrationPayment={currentRegistrationPayment}
      ledgerEntries={ledgerEntries}
      pendingMembersCount={pendingMembersCount}
    />
  )
}

export default RegistrationPayments
