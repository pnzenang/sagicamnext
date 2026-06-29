import Link from 'next/link'

import { Separator } from '@/components/ui/separator'
import LogoSmall from '@/components/logoSmall'
import Logo from '@/components/logo'
import { publicText, translatePublicNavigationLabel, type AppLanguage } from '@/lib/i18n'

const footerNavigation = [
  { label: 'Mission', href: '#mission' },
  { label: 'Benefits', href: '#benefits' },
  { label: 'Fees & Payments', href: '#fees' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Contact', href: '#contact' }
]

const MegaFooter = ({ language = 'en' }: { language?: AppLanguage }) => {
  const copy = publicText[language]

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
          {footerNavigation.map(item => (
            <Link key={item.href} href={item.href}>
              {translatePublicNavigationLabel(item.label, language)}
            </Link>
          ))}
        </div>
      </div>
      <Separator />
      <div className='mx-auto flex max-w-7xl justify-center px-4 py-8 sm:px-6 lg:px-8'>
        <p className='text-center font-medium text-balance'>
          {`©${new Date().getFullYear()}`}{' '}
          <Link href='#' className='text-primary'>
            SAGICAM
          </Link>
          , {copy.footerRights}
        </p>
      </div>
    </footer>
  )
}

export default MegaFooter
