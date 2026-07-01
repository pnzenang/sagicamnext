import type { ReactNode } from 'react'

import { Card } from '@/components/ui/card'

const AuthCard = ({ children }: Readonly<{ children: ReactNode }>) => {
  return (
    <Card className='w-full max-w-md items-center gap-5 p-6 text-center shadow-lg sm:p-8'>
      <div className='flex w-full flex-col items-center'>{children}</div>
    </Card>
  )
}

export default AuthCard
