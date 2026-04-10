'use client'

import { MoonStarIcon, SunIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

import { PrimaryFlowButton } from '@/components/ui/flow-button'

const ModeToggleSmall = () => {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <PrimaryFlowButton
      size='xs'
      className='bg-accent relative flex h-6 w-6 items-center justify-center rounded-full'
      onClick={() => setTheme(resolvedTheme === 'light' ? 'dark' : 'light')}
    >
      <MoonStarIcon className='scale-100 dark:scale-0' />
      <SunIcon className='absolute scale-0 text-yellow-400 dark:scale-100' />
      <span className='sr-only'>Toggle theme</span>
    </PrimaryFlowButton>
  )
}

export { ModeToggleSmall }
