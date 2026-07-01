'use client'

import { useEffect, useState } from 'react'

import { LogInIcon } from 'lucide-react'

import Link from 'next/link'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { PrimaryFlowButton, SecondaryFlowButton } from '@/components/ui/flow-button'

import { HeaderNavigation, HeaderNavigationSmallScreen, type Navigation } from '@/components/layout/header-navigation'
import { LanguageToggle } from '@/components/global/LanguageToggle'

import type { AppLanguage } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import Logo from '../logo'
import { ModeToggle } from './mode-toggle/mode-toggle'
import LogoSmall from '../logoSmall'

type HeaderProps = {
  navigationData: Navigation[]
  language?: AppLanguage
  loginLabel?: string
  className?: string
}

const Header = ({ navigationData, language = 'en', loginLabel = 'Login', className }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 h-20 w-full transition-all duration-300 sm:h-24 lg:h-28',
        {
          'bg-card/75 backdrop-blur-sm': isScrolled
        },
        className
      )}
    >
      <div className='lg:plx-8 flex h-full items-center justify-between gap-4 border-b px-4 sm:px-6 lg:pl-2'>
        {/* Logo */}
        <Link href='/#home'>
          <div className='flex items-center gap-3'>
            <Logo className='hidden sm:block' />
            <LogoSmall className='block sm:hidden' />
          </div>
        </Link>

        {/* Navigation */}
        <HeaderNavigation
          navigationData={navigationData}
          navigationClassName='[&_[data-slot="navigation-menu-list"]]:gap-1'
        />

        {/* Actions */}
        <div className='flex items-center gap-4 sm:gap-6'>
          <LanguageToggle homeOnly initialLanguage={language} />

          <ModeToggle />

          <PrimaryFlowButton size='lg' className='max-sm:hidden' asChild>
            <Link href='/sign-in'>{loginLabel}</Link>
          </PrimaryFlowButton>

          <Tooltip>
            <TooltipTrigger asChild>
              <SecondaryFlowButton size='icon-lg' className='sm:hidden' asChild>
                <Link href='/sign-in'>
                  <LogInIcon />
                  <span className='sr-only'>{loginLabel}</span>
                </Link>
              </SecondaryFlowButton>
            </TooltipTrigger>
            <TooltipContent>{loginLabel}</TooltipContent>
          </Tooltip>

          <HeaderNavigationSmallScreen navigationData={navigationData} />
        </div>
      </div>
    </header>
  )
}

export default Header
