import { auth } from '@clerk/nextjs/server'
import { ArrowLeftRight } from 'lucide-react'

import { redirect } from 'next/navigation'

import { Card, CardContent } from '@/components/ui/card'

const AdminMemberTransfersPage = async () => {
  const { userId } = await auth()

  if (userId !== process.env.ADMIN_USER_ID) {
    redirect('/navigation-instructions')
  }

  return (
    <section className='grid w-full max-w-full min-w-0 gap-5 overflow-hidden px-0 py-4 sm:px-6 sm:py-8 lg:px-8'>
      <div>
        <h1 className='text-2xl font-extrabold tracking-normal sm:text-3xl'>Admin Member Transfers</h1>
        <p className='text-muted-foreground mt-1 text-sm'>
          Admin review for member transfer requests will be available here.
        </p>
      </div>

      <Card className='rounded-lg'>
        <CardContent className='py-10 text-center'>
          <ArrowLeftRight className='text-muted-foreground mx-auto mb-3 size-8' />
          <p className='font-semibold'>Admin member transfer placeholder</p>
          <p className='text-muted-foreground mt-1 text-sm'>This page is ready for the admin transfer workflow.</p>
        </CardContent>
      </Card>
    </section>
  )
}

export default AdminMemberTransfersPage
