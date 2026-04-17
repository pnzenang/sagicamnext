'use client'

import React from 'react'
import FormfacadeEmbed from '@formfacade/embed-react'
// import { fetchProfile } from '@/utils/actions'

const RegistrationPayments = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <div className='bg-muted mx-auto my-2 max-w-7xl rounded-lg border p-4'>
        <h1 className='text-muted-foreground py-3 text-sm font-bold sm:text-3xl lg:text-5xl'>REGISTRATION PAYMENTS</h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, please upload the list or screenshot of the members you are adding and the receipt of the
          payment. This will help us to accurately track the new members and their registration fees. Thank you for your
          understanding, you will then see your transaction recorded below the form.
        </h1>
      </div>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSeCebmSy_RZ6se_w1a0c1PqNZlkMu-YFiaVoNSDFZNCgnmuNA/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vRL8l_xx1WdhXq8iVw201RrUVaJSfm-4dkyBcBwyazvnYCbucx4BY5Kw-Z2lRpi8W3J0WdBse0cKCvz/pubhtml?widget=true&amp;headers=false'
        className='mx-auto h-150 w-full max-w-7xl rounded-lg border py-10'
      ></iframe>
    </section>
  )
}

export default RegistrationPayments
