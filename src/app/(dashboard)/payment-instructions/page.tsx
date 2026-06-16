import React from 'react'

import Features from '@/components/shadcn-studio/blocks/features-section-10/features-section-10'
import { fetchProfile } from '@/utils/actions'

const PaymentInstructions = async () => {
  const user = await fetchProfile()

  return (
    <section className='max-w-full min-w-0 overflow-hidden py-8 sm:py-16 lg:py-8'>
      <div className='mx-auto max-w-7xl px-0 sm:px-6 lg:px-8'>
        {/* FAQ Header */}
        <div className='mb-12 space-y-4 md:mb-8 lg:mb-12'>
          <h2 className='text-2xl font-semibold md:text-3xl lg:text-5xl'>PAYMENT INSTRUCTIONS</h2>
          <p className='text-muted-foreground text-sm sm:text-xl'>
            SAGICAM accepts payments through various methods, including online payments, bank transfers, and in-person
            payments. <br />
            To ensure a smooth payment process, please follow the instructions provided for each payment method. <br />
            For online payments, you can use our secure payment portal to make your payment. For bank transfers, please
            use the provided bank account details and include your member ID in the reference. For in-person payments,
            please visit our office during business hours. <br />
            If you have any questions or need assistance with the payment process, please don&apos;t hesitate to contact
            us. We are here to help you with any issues or concerns you may have regarding payments.
            <br />
          </p>
        </div>
      </div>
      <Features />
    </section>
  )
}

export default PaymentInstructions
