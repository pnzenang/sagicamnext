import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon } from 'lucide-react'

import { Separator } from '@/components/ui/separator'

import Link from 'next/link'
import LogoSmall from '@/components/logoSmall'
import Logo from '@/components/logo'

const MegaFooter = () => {
  return (
    <footer className='bg-primary/20'>
      <Separator />
      <div className='bg-primary/20 mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 max-md:flex-col sm:px-6 lg:px-4'>
        <Link href='/#home'>
          <div className='flex items-center gap-3'>
            <Logo className='hidden sm:block' />
            <LogoSmall className='block sm:hidden' />
          </div>
        </Link>
        <div className='flex items-center gap-6 whitespace-nowrap *:font-semibold'>
          <Link href='#mission'>Mission</Link>
          <Link href='#benefits'>Benefits</Link>
          <Link href='#fees'>Fees & Payments</Link>
          <Link href='#faq'>FAQ</Link>
          <Link href='#contact'>Contact</Link>
        </div>
      </div>
      <Separator />
      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 lg:px-8'>
        <p className='text-center font-medium text-balance'>
          {`©${new Date().getFullYear()}`}{' '}
          <Link href='#' className='text-primary'>
            SAGICAM
          </Link>
          ,All rights reserved.
        </p>
      </div>
    </footer>
  )
}

export default MegaFooter
