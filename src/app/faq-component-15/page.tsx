import FAQ from '@/components/shadcn-studio/blocks/faq-component-15/faq-component-15'

const faqItems = [
  {
    question: 'Who can become a member of SAGICAM?',
    answer:
      "We offer a variety of accommodations including hotels, motels, and vacation rentals to suit every traveler's needs."
  },
  {
    question: 'How much is the registration fee?',
    answer:
      'You can make a booking through our website, mobile app, or by calling our customer service team directly. We make it easy for you to reserve your perfect accommodation.'
  },
  {
    question: 'How do I make a payment?',
    answer:
      'Our cancellation policy varies depending on the property and rate type. Generally, you can cancel up to 24-48 hours before check-in without penalty. Check your booking details for specific terms.'
  },
  {
    question: 'Who can be a Sponsor in SAGICAM?',
    answer:
      "Yes, most bookings can be modified depending on availability and the property's terms. Contact our customer service team or use your online account to make changes."
  },
  {
    question: 'Are pets allowed in your accommodations?',
    answer:
      'Pet policies vary by property. Many of our accommodations are pet-friendly, but we recommend checking the specific property details or contacting us directly to confirm pet policies and any associated fees.'
  }
]

const FAQPage = () => {
  return <FAQ faqItems={faqItems} />
}

export default FAQPage
