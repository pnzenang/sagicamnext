'use client'

import FormfacadeEmbed from '@formfacade/embed-react'

const ButtonIconDemo = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <div className='bg-muted mx-auto my-2 max-w-7xl rounded-lg border p-4'>
        <h1 className='text-muted-foreground py-3 text-sm font-bold sm:text-3xl lg:text-5xl'>
          DEATH DOCUMENTATION UPLOADS
        </h1>
        <h1 className='text-muted-foreground text-sm font-bold sm:text-lg'>
          In this section, please upload your death documentation. This will help us to accurately report your
          documentation and ensure that they are properly recorded. Thank you for your understanding, you will then see
          your transaction recorded below the form, all the documents will be discarded after the review and use.
        </h1>
      </div>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLScaV4wOpaAylqgEui1hI4j1d_qZ7qXtn4ljkVzFMK867ZAsJg/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQs9O3W9AZedzLd9a0-klXtg_4dBeUPmPVb62KHoGxHKRkpxLRcr50Mwbdl-w4Ng6HveA8oYde4ag1g/pubhtml?gid=196975544&amp;single=true&amp;widget=true&amp;headers=false'
        className='mx-auto mt-5 h-100 w-full max-w-7xl rounded-lg border'
      >
        {' '}
      </iframe>
    </section>
  )
}

export default ButtonIconDemo
