'use client'

import { useEffect } from 'react'

import Link from 'next/link'

import { AlertTriangle, Home, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'

const DashboardError = ({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) => {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <section className='mx-auto flex w-full max-w-xl flex-col items-center gap-4 px-4 py-16 text-center'>
      <span className='flex size-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
        <AlertTriangle className='size-7' aria-hidden='true' />
      </span>
      <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Something went wrong</h1>
      <p className='text-muted-foreground text-sm leading-6 sm:text-base'>
        This page could not finish loading. Nothing you entered was lost unless you were in the middle of saving. Please
        try again. If it keeps happening, contact SAGICAM at info@sagicam.org and mention the reference below.
      </p>
      {error.digest ? (
        <p className='bg-muted rounded-md px-3 py-1.5 font-mono text-xs'>Reference: {error.digest}</p>
      ) : null}
      <div className='mt-2 flex flex-wrap justify-center gap-3'>
        <Button type='button' onClick={reset}>
          <RotateCcw aria-hidden='true' />
          Try again
        </Button>
        <Button asChild variant='outline'>
          <Link href='/all-members'>
            <Home aria-hidden='true' />
            Go to my dashboard
          </Link>
        </Button>
      </div>
    </section>
  )
}

export default DashboardError
