import type { ComponentType, ReactNode } from 'react'

import { ExternalLink, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

type FAQ = {
  question: string
  answer: ReactNode
}[]

type FAQTab = {
  value: string
  label: string
  icon: ComponentType
  faqs: FAQ
}[]

const FAQ = ({ tabsData: _tabsData }: { tabsData: FAQTab }) => {
  return (
    <section className='py-8 sm:py-12'>
      <div className='mx-auto flex max-w-3xl flex-col items-center gap-8 px-4 text-center sm:px-6 lg:px-8'>
        <div className='space-y-4'>
          <div className='mx-auto inline-flex size-14 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'>
            <MessageCircle className='size-7' aria-hidden='true' />
          </div>
          <div className='space-y-3'>
            <h1 className='text-2xl font-semibold sm:text-4xl'>Join WhatsApp Group</h1>
            <p className='text-muted-foreground mx-auto max-w-2xl text-base leading-7 sm:text-lg'>
              Click the QR code or scan it with your phone to join the SAGICAM UPDATES WhatsApp group and receive
              important announcements.
            </p>
          </div>
        </div>

        <div className='flex w-full flex-col items-center gap-6 rounded-md border bg-emerald-50/40 p-6 dark:bg-emerald-950/10 sm:p-8'>
          <Link
            href='https://chat.whatsapp.com/Cei0t0msqtB0p8BkhqnkkQ?mode=gi_t'
            aria-label='Open SAGICAM WhatsApp group'
          >
            <Image
              className='rounded-md border bg-white p-3 shadow-sm'
              src='https://res.cloudinary.com/dp8tkb7hq/image/upload/v1777955982/Untitled_design_gqrtw1.svg'
              width={300}
              height={300}
              alt='SAGICAM WhatsApp group QR code'
              priority
            />
          </Link>

          <Button asChild className='bg-emerald-700 text-white hover:bg-emerald-800'>
            <Link href='https://chat.whatsapp.com/Cei0t0msqtB0p8BkhqnkkQ?mode=gi_t'>
              Open WhatsApp Group
              <ExternalLink aria-hidden='true' />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default FAQ
