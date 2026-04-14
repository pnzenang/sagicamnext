'use client'
import FormfacadeEmbed from '@formfacade/embed-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

const ButtonIconDemo = () => {
  return (
    <div>
      <FormfacadeEmbed
        formFacadeURL='https://formfacade.com/include/112423225580039142072/form/1FAIpQLScaV4wOpaAylqgEui1hI4j1d_qZ7qXtn4ljkVzFMK867ZAsJg/classic.js/?div=ff-compose'
        onSubmitForm={() => console.log('Form submitted')}
      />
      <iframe
        src='https://docs.google.com/spreadsheets/d/e/2PACX-1vQs9O3W9AZedzLd9a0-klXtg_4dBeUPmPVb62KHoGxHKRkpxLRcr50Mwbdl-w4Ng6HveA8oYde4ag1g/pubhtml?gid=196975544&amp;single=true&amp;widget=true&amp;headers=false'
        className='mx-auto mt-10 h-150 w-full max-w-7xl rounded-lg border'
      >
        {' '}
      </iframe>
    </div>
  )
}

export default ButtonIconDemo
