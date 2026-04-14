import FAQ from '@/components/shadcn-studio/blocks/faq-component-15/faq-component-15'

const faqItems = [
  {
    question: 'Who can become a member of SAGICAM?',
    answer:
      'Any individual living in Cameroon can become a SAGICAM member, but they must must be sponsored by a person (moral or physical) living living in the USA. the relationship between the sponsor and the member must be either a family relationship or a friendship relationship. The sponsor must also be able to provide financial support to the member for the duration of their membership.'
  },
  {
    question: 'How do members get registered?',
    answer:
      'The Sponsor must create an account on the SAGICAM website and submit registration information and fees for his or her  loved ones.'
  },
  {
    question: 'How do I make a payment or contribution with SAGICAM?',
    answer:
      'All the payment instructions are available on  SAGICAM website in the sponsor portal, once the sponsor has created an account.'
  },
  {
    question: 'Who can be a Sponsor in SAGICAM?',
    answer:
      'Any individual living in the USA can be a sponsor in SAGICAM, but they must be able to provide financial support to the member for the duration of their membership. The sponsor must also have a family relationship or a friendship relationship with the member they are sponsoring.'
  },
  {
    question: 'What is the process for becoming a member of SAGICAM?',
    answer:
      'Once the sponsor has created an account on the SAGICAM website and     submitted the necessary registration information, the member will be reviewed for eligibility and approved within 2-3 months during that process, the sponsor should manage to pay the required fees and deposits.'
  },
  {
    question: 'At What Point in the Process do I Make Payments for registration?',
    answer:
      'The sponsor should submit his or her loved ones registration fees and anticipated contributions before the loved ones are approved, the loved ones become a member when their status go from pending to vested, and that will only happen after the sponsor has paid the required fees and deposits and the loved ones have been in SAGICAM database for at Least 60 days.'
  },
  {
    question: 'What is the amount of payout to the beneficiaries?',
    answer:
      'It depends on the longevity of the member. It is staggered accordingly: 1) 60 days to 180 days of membership: $1,000  2) 181 days to 1 year of membership: $2,000  3) 1 year and up of membership: $6,000  All the details about the payout structure are available on the SAGICAM website in the sponsor portal.'
  }
]

const FAQs = () => {
  return (
    <section id='#faq' className='bg-primary/20 py-8 sm:py-16 lg:py-24'>
      <FAQ faqItems={faqItems} />
    </section>
  )
}

export default FAQs
