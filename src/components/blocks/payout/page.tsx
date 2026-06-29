import Pricing, {
  type PayoutSectionCopy,
  type Plan
} from '@/components/shadcn-studio/blocks/pricing-component-07/pricing-component-07'

export type PayoutCopy = PayoutSectionCopy & {
  plans: Plan[]
}

export const defaultPayoutCopy: PayoutCopy = {
  badge: 'SAGICAM PAYOUT SCHEDULE',
  title: 'SAGICAM Payout Schedule',
  description:
    'A Comprehensive Summary of SAGICAM Payout Schedule the more detailed information is available in the SAGICAM Internal Rules in the sponsor dashboard.',
  plans: [
    {
      id: 'free',
      name: 'NO Contribution-Sponsor received:',

      price: '$0',

      features: [
        'The loved one was not vested or',
        'The loved one stop contributing or',
        'The loved one was not vested registered at death or',
        'The death was announced after 30 days'
      ],
      buttonText: 'Try Free Version'
    },
    {
      id: 'business',
      name: 'Contribution Done-Sponsor received:',

      price: '$1,000',

      features: [
        'The loved one has a longevity of 6 months or less and ',
        'The loved one was vested before passing away  and',
        'The death was announced within 10 days of the death date'
      ],
      buttonText: 'Start Business Plan'
    },
    {
      id: 'enterprise',
      name: 'Contribution Done-The Sponsor received:',

      price: '$2,000',

      features: [
        'The loved one has a longevity from 6 months to 12 months  ',
        'The loved one was vested before passing away  ',
        'The death was announced within 10 days of the death date'
      ],
      buttonText: 'Get Enterprise'
    },
    {
      id: 'custom',
      name: 'Contribution Done-Sponsor received:',

      price: '$6,000',

      features: [
        'The loved one has a longevity above 12 months and ',
        'The loved one was vested before passing away and ',
        'The death was announced within 10 days of the death date'
      ],
      buttonText: 'Contact Sales'
    }
  ]
}

const Payout = ({ copy = defaultPayoutCopy }: { copy?: PayoutCopy }) => {
  return (
    <section id='benefits' className='py-1'>
      <Pricing
        copy={{
          badge: copy.badge,
          description: copy.description,
          title: copy.title
        }}
        plans={copy.plans}
      />
    </section>
  )
}

export default Payout
