'use client'

import React from 'react'
import FormfacadeEmbed from '@formfacade/embed-react'
// import { fetchProfile } from '@/utils/actions'

const RegistrationPayments = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSci8U_8cWIuWoiWob6Hx1-WH2gBfelrTVWGnhK8BCn9FH5OkA/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vSJLcE1s8Z0nKXZB065VKAYS6CguaFvZFYfUOICSzEcAP6VEnXsZbHC1fft30X1WkAcM2TWJGuSscb1/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-90 w-full max-w-18/20 rounded-lg border'
      ></iframe>
    </section>
  )
}

export default RegistrationPayments
