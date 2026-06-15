import { SponsorContributionPaymentSection } from '@/components/dashboard/SponsorPaymentSections'
import { fetchCurrentSponsorContribution } from '@/utils/actions'
import { fetchSponsorPaymentLedgerEntries, sponsorPaymentTypes } from '@/utils/sagicam-payment-ledger'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ContributionsPayments = async () => {
  const currentContribution = await fetchCurrentSponsorContribution()

  const ledgerEntries = await fetchSponsorPaymentLedgerEntries(currentContribution.sponsorCode, {
    noStore: true,
    paymentType: sponsorPaymentTypes.contribution
  })

  return <SponsorContributionPaymentSection currentContribution={currentContribution} ledgerEntries={ledgerEntries} />
}

export default ContributionsPayments
