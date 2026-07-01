import PaymentInstructionsContent from '@/components/payment-instructions-content'
import { fetchProfile } from '@/utils/actions'

const PaymentInstructions = async () => {
  const profile = await fetchProfile()

  return <PaymentInstructionsContent sponsorCode={profile.sponsorCode} />
}

export default PaymentInstructions
