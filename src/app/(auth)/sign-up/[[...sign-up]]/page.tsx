import { ClerkLoaded, ClerkLoading, SignUp } from '@clerk/nextjs'

const authAppearance = {
  elements: {
    card: "[&_a[href*='clerk.com']]:hidden [&_.cl-logoBox]:hidden [&_.cl-logoImage]:hidden",
    cardBox: 'shadow-none',
    footerPages: 'hidden',
    logoBox: 'hidden',
    logoImage: 'hidden',
    rootBox: 'mx-auto'
  }
}

const AuthLoadingCard = () => {
  return (
    <div className='bg-background w-full max-w-md rounded-lg border p-8 shadow-sm'>
      <div className='space-y-6'>
        <div className='space-y-4'>
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
