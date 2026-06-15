import { SponsorContributionPaymentSection } from '@/components/dashboard/SponsorPaymentSections'
import { fetchCurrentSponsorContribution } from '@/utils/actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const ContributionsPayments = async () => {
  const currentContribution = await fetchCurrentSponsorContribution()

  return <SponsorContributionPaymentSection currentContribution={currentContribution} />
}

export default ContributionsPayments
