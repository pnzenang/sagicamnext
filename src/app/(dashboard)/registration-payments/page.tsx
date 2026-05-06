'use client'

import React from 'react'
import FormfacadeEmbed from '@formfacade/embed-react'
import Link from 'next/link'
import Image from 'next/image'
// import { fetchProfile } from '@/utils/actions'

const RegistrationPayments = () => {
  // const user = await fetchProfile()
  return (
    <section>
      <div className='flex flex-col items-center justify-center gap-8 sm:flex-row'>
        <div>
          <Link href='https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQUNUSVZFIFNPTElEQVJJVFkgTFREIiwiYWN0aW9uIjoicGF5bWVudCIsInRva2VuIjoiaW5mb0BzYWdpdXNhLm9yZyJ9'>
            <Image
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1778042720/sagiQrCode_jmwsbf.svg'
              width={300}
              height={300}
              alt='QR-Code'
            />
          </Link>
        </div>
        <div className='mt-5 max-w-19/20 rounded-lg'>
          <FormfacadeEmbed
            formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLSci8U_8cWIuWoiWob6Hx1-WH2gBfelrTVWGnhK8BCn9FH5OkA/classic.js/?div=ff-compose'
            onSubmitForm={() => console.log('Form submitted')}
          />
        </div>
      </div>
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vSJLcE1s8Z0nKXZB065VKAYS6CguaFvZFYfUOICSzEcAP6VEnXsZbHC1fft30X1WkAcM2TWJGuSscb1/pubhtml?widget=true&amp;headers=false'
        className='mx-auto mt-5 h-110 w-full max-w-19/20 rounded-lg border'
      ></iframe>
    </section>
  )
}

export default RegistrationPayments
