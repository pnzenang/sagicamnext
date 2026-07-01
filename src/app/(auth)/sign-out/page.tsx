'use client'

import { useEffect, useState } from 'react'

import { useAuth } from '@clerk/nextjs'
import { LoaderCircle, LogOutIcon } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

import AuthCard from '../auth-card'

const SignOutPage = () => {
  const router = useRouter()
  const { isLoaded, isSignedIn, signOut } = useAuth()
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    if (!isLoaded) return

    if (!isSignedIn) {
      router.replace('/')

      return
    }

    void signOut({ redirectUrl: '/' }).catch(() => {
      setHasError(true)
    })
  }, [isLoaded, isSignedIn, router, signOut])

  return (
    <section className='bg-muted flex min-h-dvh items-center justify-center px-4 py-10'>
      <AuthCard>
        <div className='bg-muted flex size-12 items-center justify-center rounded-full'>
          {hasError ? <LogOutIcon className='size-5' /> : <LoaderCircle className='size-5 animate-spin' />}
        </div>
        <div className='space-y-2'>
          <h1 className='text-2xl font-semibold'>{hasError ? 'Sign out paused' : 'Signing you out'}</h1>
          <p className='text-muted-foreground text-sm'>
            {hasError
              ? 'We could not finish signing you out. Please try again.'
              : 'Your session is being closed securely.'}
          </p>
        </div>
        {hasError ? (
          <div className='flex w-full flex-col gap-2 sm:flex-row'>
            <Button className='w-full' onClick={() => void signOut({ redirectUrl: '/' })}>
              Try again
            </Button>
            <Button variant='outline' className='w-full' asChild>
              <Link href='/'>Go home</Link>
            </Button>
          </div>
        ) : null}
      </AuthCard>
    </section>
  )
}

export default SignOutPage
