import Pricing from '@/components/shadcn-studio/blocks/pricing-component-08/pricing-component-08'

const pricingPlans = [
  {
    name: 'Registration Fee',
    preview: 'Now',
    price: 10,
    description: 'This is a one-time fee to register one loved one with our platform.',
    buttonText: 'Per Member',
    frequency: 'Lifetime',
    features: [
      '1 Member ',
      'Paid withing 60 days of the registration date',
      'Non-refundable and non-transferable',
      'Loved one will ne be vested if not paid ',
      'Registration voided if not paid within 60 days'
    ]
  },
  {
    name: 'Early  Contribution',
    preview: 'Now',
    price: 30,
    description: 'This is a one-time anticipated contribution, to be used when you can not contribute.',
    buttonText: 'Per Member',
    frequency: 'One-time',
    features: [
      '1 Member ',
      'Paid withing 60 days of the registration date',
      'Non-refundable and non-transferable',
      'Loved one will not be vested if not paid ',
      'Registration voided if not paid within 60 days'
    ]
  },
  {
    name: 'Monthly Contribution',
    preview: 'around',
    price: 9,
    description: 'This is a monthly contribution plan for to help the bereaved sponsors.',
    buttonText: 'Per Member',
    frequency: '/Monthly at this time',
    features: [
      '1 Member ',
      'Occurs monthly while the member is active',
      'Non-refundable and non-transferable',
      'The loved one will be excluded if not paid ',
      'Can be replaced by the early contribution '
    ]
  }
]

const Payout = () => {
  return (
    <section id='fees' className='bg-primary/20 py-8 sm:py-16 lg:py-24'>
      <Pricing pricingPlans={pricingPlans} />
    </section>
  )
}

export default Payout
