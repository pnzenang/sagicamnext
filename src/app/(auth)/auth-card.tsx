import type { ReactNode } from 'react'

import Link from 'next/link'

import Logo from '@/components/logo'
import { Card } from '@/components/ui/card'

const AuthCard = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <Card className='w-full max-w-md items-center gap-5 p-6 text-center shadow-lg sm:p-8'>
      <Link href='/' className='w-fit'>
        <Logo />
      </Link>
      <div className='flex w-full flex-col items-center'>{children}</div>
    </Card>
  )
}

export default AuthCard
