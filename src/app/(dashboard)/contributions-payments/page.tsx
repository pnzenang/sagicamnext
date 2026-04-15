'use client'

import React from 'react'
import FormfacadeEmbed from '@formfacade/embed-react'

const ContributionsPayments = () => {
  return (
    <section>
      <div className='bg-muted mx-auto my-2 max-w-7xl rounded-lg border p-4'>
        <h1 className='text-muted-foreground py-3 text-sm font-bold sm:text-3xl lg:text-5xl'>CONTRIBUTIONS PAYMENTS</h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, please upload your contributions payment receipts. This will help us to accurately report
          your contributions and ensure that they are properly recorded. Thank you for your understanding, you will then
          see your transaction recorded below the form
        </h1>
      </div>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSf43TWvXpb0cMLJVaVqjASrx2HYZdNlgEnYwtWIfbNDULRQBg/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vSPUT-DIX6g1x63NaGqO7sdtfQ0-V6lseS35irYc1sHoIE8iLn4qzz-82UnbeZk-eLK23VoIPMeHLFH/pubhtml?widget=true&amp;headers=false'
        className='mx-auto h-150 w-full max-w-7xl rounded-lg border py-10'
      ></iframe>
    </section>
  )
}

export default ContributionsPayments
