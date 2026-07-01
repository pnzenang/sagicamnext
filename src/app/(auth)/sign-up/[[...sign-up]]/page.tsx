import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'

const authLogoUrl = 'https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775889433/sagicam_bkoygk.svg'

const authAppearance = {
  elements: {
    card: "[&_a[href*='clerk.com']]:hidden",
    cardBox: 'shadow-none',
    footerPages: 'hidden',
    header:
      "gap-4 before:mx-auto before:block before:h-20 before:w-20 before:bg-[url('https://res.cloudinary.com/dp8tkb7hq/image/upload/v1775889433/sagicam_bkoygk.svg')] before:bg-contain before:bg-center before:bg-no-repeat before:content-['']",
    logoBox: 'hidden',
    logoImage: 'hidden',
    rootBox: 'mx-auto'
  }
}

const AuthLogo = () => (
  <Link href='/' aria-label='SAGICAM home' className='block'>
    <Image src={authLogoUrl} alt='SAGICAM logo' width={112} height={112} priority className='mx-auto h-20 w-auto' />
  </Link>
)

const AuthLoadingCard = () => {
  return (
    <div className='bg-background w-full max-w-md rounded-lg border p-8 shadow-sm'>
      <div className='space-y-6'>
        <div className='space-y-4'>
          {/* <AuthLogo /> */}
          <div className='space-y-2'>
            <div className='bg-muted mx-auto h-7 w-40 animate-pulse rounded-md' />
            <div className='bg-muted mx-auto h-4 w-64 max-w-full animate-pulse rounded-md' />
          </div>
        </div>
        <div className='space-y-3'>
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
          <div className='bg-muted h-10 w-full animate-pulse rounded-md' />
        </div>
      </div>
    </div>
  )
}

const SignUpPage = () => {
  return (
    <section className='bg-muted flex min-h-dvh items-center justify-center px-4 py-10'>
      <ClerkLoading>
        <AuthLoadingCard />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp forceRedirectUrl='/profile/create' signInUrl='/sign-in' appearance={authAppearance} />
      </ClerkLoaded>
    </section>
  )
}

export default SignUpPage
